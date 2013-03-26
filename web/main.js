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

function getMaximum(ar) {
	var u = ar.slice(0);
	u.reverse();
	return u[0];
}

function getMinimum(ar) {
	var u = ar.slice(0);
	return u[0];
}

//// WEBSITE READER EQUIVALENT ------------------------------------------------

var request;

/**
 * Cross platform method to get XMLHttpRequest objects. Taken from an article
 * published by Brett McLaughlin.
 */
function createRequest() {
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
}


//// JAVASCRIPT-Y STUFF BELOW -------------------------------------------------

var RANKINGS = "";
var MATCHES = "";

var rankingsMatrix;
var matchesMatrix;

function Main() {
	// Ran by a script at the bottom of the page (so that means the document is here)
	createRequest();
	request.open("GET","?grab=2013comp/events/MIGBL/rankings.html", true); 
	
	/*
	 * Synch call so that the page doesn't freeze when it starts;
	 * reduces page load time at the cost of causing a "waiting for data" message
	 * to be displayed for a second
	 */
	request.onreadystatechange = Main2; /*Proceed to here to actually start working*/
	request.send();
	document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
}

function Main2() {
	if (request.readyState == 4){
		// Store Rankings, which have successfully loaded
		RANKINGS = request.responseText;
		createRequest();
		
		// Request Match Results
		request.open("GET", "?grab=2013comp/events/MIGBL/matchresults.html", true); 
		request.onreadystatechange = Main3; // Proceed to here to actually start working
		request.send();
	}
}

/**
 *  The request data has been received, so parsing and computation can begin.
 */
function Main3() {
	if (request.readyState == 4) {
		// Store Match Results, which have successfully loaded
		MATCHES = request.responseText;
		
		// What is this for?
		document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\">" + "ERROR IN FETCHING RESULTS" + "</td></tr>";
		
		// Compute
		compute();
		
		// Display
		Main4();
	}
}

function compute(){
	// Dump Data into Arrays
	rankingsMatrix = Table("RANKINGS").getBody(); // Dim1 = Columns
	matchesMatrix = Table("MATCHES").getBody();	// Dim1 = Columns
	
	// Create Match Pair Frequency Array
	
	// Solve
	console.log(matrixToFormattedString(matchesMatrix));
}

/**
 * The results are in!  Data is contained within RANKINGS and MATCHES.
 */
function Main4() {
	// Display Table
	var s = "";
	for (var row = 0; row < rankingsMatrix[0].length; row++) {
		var mx = 40;//getMaximum(rankingsMatrix[0]);
		var mn = 1;//getMinimum(rankingsMatrix[0]);
		var rk = rankingsMatrix[0][row];
		s += "<tr>" +
				"<td style=\"background:#EEEEEE;\">" + rankingsMatrix[1][row] + "</td>" +
				"<td style=\"background:" + getRedGreen( mn ,mx - rk, mx ) +  "\">" + rankingsMatrix[0][row] + "</td>" +
				
				"<td colspan='4'></td></tr>"; // Fill Rest of Table
	}
	
	document.getElementById("thedata").innerHTML = s;
	setupTable(document.getElementById("thetable"));
}
