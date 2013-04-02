//// AUXILIARY FUNCTIONS ------------------------------------------------------

function colorLerp(c1,c2,v)
{
  return [c1[0]*(1-v) + c2[0]*v , c1[1]*(1-v) + c2[1]*v , c1[2]*(1-v) + c2[2]*v ];
}

function colorToHex(c)
{
  var u = "0123456789ABCDEF";
  function m(x)
  {
    return Math.floor(x);
  }
  return "#" + u.charAt(m(c[0]/16)) + u.charAt(m(c[0])%16) + u.charAt(m(c[1]/16)) + u.charAt(m(c[1])%16) + u.charAt(m(c[2]/16)) + u.charAt(m(c[2])%16);
}

function getRedGreen(lo,val,hi) {
	var md = (lo + hi)/2;
	var hf = (hi - lo)/2;
	var A = [227,137,147];//[200,20,40];
	var B = [247,247,137];//[240,240,20];
	var C = [152,227,167];//[50,200,80];
	if (val < md) {
		var x = (val - lo) / hf;
		return colorToHex(colorLerp(A,B,x));
	}
	var x = (val - md) / hf;
	return colorToHex(colorLerp(B,C,x));
}

function getMaximum(array) {
	var max = array[0];
	for(var i = 1; i < array.length; i++){
		if(!isNaN(array[i]) && array[i] > max){
			max = array[i];
		}
	}
	return max;
}

function getMinimum(array) {
	var min = array[0];
	for(var i = 1; i < array.length; i++){
		if(!isNaN(array[i]) && array[i] < min){
			min = array[i];
		}
	}
	return min;
}

//// WEBSITE READER EQUIVALENT ------------------------------------------------
/**
 * Cross platform method to get XMLHttpRequest objects. Taken from an article
 * published by Brett McLaughlin.
 */
function createRequest() {
	var request;
	try{
		request = new XMLHttpRequest();
	} catch(trymicrosoft) {
		try{
			request = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(othermicrosoft){
			try{
				request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(failed) {
				request = false;
			}
		}
	}
	
	// Ensure Request Existence
	if(!request) {
		alert("Unfortunately, your browser cannot utilize AASK. Please enable, or switch to a browser with, XMLHttpRequests! (Chrome, Opera, Safari, IE, others)");
	}
	
	return request;
}


//// JAVASCRIPT-Y STUFF BELOW -------------------------------------------------

var frcEvent;
var autonEC;
var climbEC;
var teleopEC;
var totalEC;
var matchPredictions;

/**
 * Synch call so that the page doesn't freeze when it starts;
 * reduces page load time at the cost of causing a "waiting for data" message
 * to be displayed for a second.
 */
function Main() {
	
	frcEvent = MatchParser(rankingsPage, resultsPage);
	frcEvent.parse(compute);
	
	// Display Waiting Message
	document.getElementById("oprdata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
}

function compute(){
	// Compute Estimated Contributions
	if(true){
		autonEC = solveLU(frcEvent.mpf, frcEvent.autonPoints);
		climbEC = solveLU(frcEvent.mpf, frcEvent.climbPoints);
		teleopEC = solveLU(frcEvent.mpf, frcEvent.teleopPoints);
		totalEC = solveLU(frcEvent.mpf, frcEvent.totalPoints);
	} else {
		autonEC = gaussSeidel(frcEvent.mpf, frcEvent.autonPoints);
		climbEC = gaussSeidel(frcEvent.mpf, frcEvent.climbPoints);
		teleopEC = gaussSeidel(frcEvent.mpf, frcEvent.teleopPoints);
		totalEC = gaussSeidel(frcEvent.mpf, frcEvent.totalPoints);
	}
	
	console.log(matrixToFormattedString(frcEvent.mpf));
	
	var estimate = multiplyMatVec(frcEvent.mpf, totalEC);
	var residual = subtractVec(estimate, frcEvent.totalPoints);
	var squaredError = residual[0];
	for(var i = 1; i < residual.length; i++){
		squaredError += residual[i] * residual[i];
	}
	
	console.log("SQUARED ERROR:  " + squaredError);
	
	// Minimum & Maximum Values, for Coloring
	autonEC.min = getMinimum(autonEC);
	autonEC.max = getMaximum(autonEC);
	climbEC.min = getMinimum(climbEC);
	climbEC.max = getMaximum(climbEC);
	teleopEC.min = getMinimum(teleopEC);
	teleopEC.max = getMaximum(teleopEC);
	totalEC.min = getMinimum(totalEC);
	totalEC.max = getMaximum(totalEC);
	
	// Predict Match Results
	matchPredictions = new Array(resultsBody[0].length);
	console.log("matches:  " + resultsBody[0].length);
	for(var i = 0; i < matchPredictions.length; i++){
		var red = 0;
		var blue = 0;
		for(var j = 2; j < 5; j++){
			red += totalEC[teamHash.get(resultsBody[j][i])-1];
			blue += totalEC[teamHash.get(resultsBody[j+3][i])-1];
		}
		matchPredictions[i] = {red:red, blue:blue, redWins:(red>=blue), blueWins:(blue>=red), tie:(red===blue)};
	}
	
	// Table
	populateTables();
}

/**
 * The results are in!  Create the table!
 */
function populateTables() {
	// Estimated Contributions Table
	var s = "";
	for (var row = 0; row < frcEvent.rankingsBody[0].length; row++) {
		var mx = frcEvent.teamCount;
		var mn = 1;
		var rk = frcEvent.rankingsBody[0][row];
		s += "<tr>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:" + getRedGreen(mn, mx-rk, mx) +  "\">" + frcEvent.rankingsBody[0][row] + "</td>" +
			"<td style=\"background:" + getRedGreen(autonEC.min, autonEC[row], autonEC.max) + "\">" + autonEC[row].toFixed(2) + "</td>" +
			"<td style=\"background:" + getRedGreen(climbEC.min, climbEC[row], climbEC.max) + "\">" + climbEC[row].toFixed(2) + "</td>" +
			"<td style=\"background:" + getRedGreen(teleopEC.min, teleopEC[row], teleopEC.max) + "\">" + teleopEC[row].toFixed(2) + "</td>" +
			"<td style=\"background:" + getRedGreen(totalEC.min, totalEC[row], totalEC.max) + "\">" + totalEC[row].toFixed(2) + "</td>";
	}
	
	document.getElementById("oprdata").innerHTML = s;
	setupTable(document.getElementById("oprtable"));
	
	// Match Prediction Table
	s = "";
	var correct = 0;
	for (var row = 0; row < frcEvent.resultsBody[0].length; row++) {
		var mx = frcEvent.teamCount;
		var mn = 1;
		var rk = frcEvent.rankingsBody[0][row];
		var redWinsReal = (parseInt(frcEvent.resultsBody[8][row]) >= parseInt(frcEvent.resultsBody[9][row]));
		var blueWinsReal = (parseInt(frcEvent.resultsBody[9][row]) >= parseInt(frcEvent.resultsBody[8][row]));
		var redWinsEstimate = matchPredictions[row].redWins;
		var blueWinsEstimate = matchPredictions[row].blueWins;
		var same = (redWinsReal === redWinsEstimate) && (blueWinsReal === blueWinsEstimate);
		if(same){
			correct++;
		}
		s += "<tr>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.resultsBody[1][row] + "</td>" +
			"<td style=\"background:#FFFFFF;\">" + frcEvent.resultsBody[2][row] + "</td>" +
			"<td style=\"background:#FFFFFF;\">" + frcEvent.resultsBody[3][row] + "</td>" +
			"<td style=\"background:#FFFFFF;\">" + frcEvent.resultsBody[4][row] + "</td>" +
			"<td style=\"background:#FFFFFF;\">" + frcEvent.resultsBody[5][row] + "</td>" +
			"<td style=\"background:#FFFFFF;\">" + frcEvent.resultsBody[6][row] + "</td>" +
			"<td style=\"background:#FFFFFF;\">" + frcEvent.resultsBody[7][row] + "</td>" +
			"<td style=\"background:" + (redWinsReal?"#FFAAAA":"#FFFFFF") + ";font-weight:" + (same?"bold":"normal") + ";\">" + frcEvent.resultsBody[8][row] + "</td>" +
			"<td style=\"background:" + (blueWinsReal?"#AAAAFF":"#FFFFFF") + ";font-weight:" + (same?"bold":"normal") + ";\">" + frcEvent.resultsBody[9][row] + "</td>" +
			"<td style=\"background:" + (redWinsEstimate?"#FFAAAA":"#FFFFFF") + ";font-weight:" + (same?"bold":"normal") + ";\">" + matchPredictions[row].red.toFixed(0) + "</td>" +
			"<td style=\"background:" + (blueWinsEstimate?"#AAAAFF":"#FFFFFF") + ";font-weight:" + (same?"bold":"normal") + ";\">" + matchPredictions[row].blue.toFixed(0) + "</td>";
	}
	
	console.log("correct:  " + correct);
	
	document.getElementById("matchdata").innerHTML = s;
	//setupTable(document.getElementById("matchtable"));*/
}
