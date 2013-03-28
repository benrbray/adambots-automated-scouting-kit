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
		if(array[i] > max){
			max = array[i];
		}
	}
	return max;
}

function getMinimum(array) {
	var min = array[0];
	for(var i = 1; i < array.length; i++){
		if(array[i] < min){
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

/**
 * Synch call so that the page doesn't freeze when it starts;
 * reduces page load time at the cost of causing a "waiting for data" message
 * to be displayed for a second.
 */
function Main() {
	console.log("[Main] started");
	
	console.log("\t[Main] Creating MatchParser...");
	
	frcEvent = MatchParser(rankingsPage, resultsPage);
	frcEvent.parse(compute);
	
	console.log("\t[Main] Success");
	
	// Display Waiting Message
	document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
}

function compute(){
	// Compute Estimated Contributions
	autonEC = solveLU(frcEvent.mpf, frcEvent.autonPoints);
	climbEC = solveLU(frcEvent.mpf, frcEvent.climbPoints);
	teleopEC = solveLU(frcEvent.mpf, frcEvent.teleopPoints);
	totalEC = solveLU(frcEvent.mpf, frcEvent.totalPoints);
	
	// Minimum & Maximum Values, for Coloring
	autonEC.min = getMinimum(autonEC);
	autonEC.max = getMaximum(autonEC);
	climbEC.min = getMinimum(climbEC);
	climbEC.max = getMaximum(climbEC);
	teleopEC.min = getMinimum(teleopEC);
	teleopEC.max = getMaximum(teleopEC);
	totalEC.min = getMinimum(totalEC);
	totalEC.max = getMaximum(totalEC);
	
	// Table
	populateTable();
}

/**
 * The results are in!  Create the table!
 */
function populateTable() {
	// Display Table
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
	
	document.getElementById("thedata").innerHTML = s;
	setupTable(document.getElementById("thetable"));
}
