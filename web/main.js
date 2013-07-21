/*
This file is part of the Adambots Automated Scouting Kit (AASK).

AASK is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

AASK is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
AASK.  If not, see <http://www.gnu.org/licenses/>.

AASK was started during the 2013 FIRST season by Ben Bray and Curtis Fenner of
Team 245, the Adambots, for use by other FRC teams.
*/

var frcEvent;

function Main() {
	//This function is directly called by the page, and begins all.

	//Generate Graph Context
	graphMatches = document.getElementById("graphMatches").getContext("2d");
	graphDistro = document.getElementById("graphDistro").getContext("2d");
	
	//Set a  waiting message.
	document.getElementById("bigdata").innerHTML = "<tr><td colspan=\"9\">Waiting for data from <em>FIRST</em>...</td></tr>";
	document.getElementById("correlationdata").innerHTML = "<tr><td colspan=\"10\">Waiting for data from <em>FIRST</em>...</td></tr>";
	
	//Create the FRCEvent object for the current event.
	frcEvent = new FRCEvent(eventURL, eventName,  // <-- frcevent.js
		function () {
			//This is a callback for after the event is loaded and analyzed.
			//This generates all visible page features using the data embedded in frcEvent.
		
			if (frcEvent.failed) {
				//If for some reason the frcEvent could not be created correctly, frcEvent.failed is true.
				//This will run, giving up on rendering the page.
				document.getElementById("bigdata").innerHTML = "<tr><td class=\"error\" colspan=\"9\">No data is available for this event right now.</td></tr>";
				document.getElementById("correlationdata").innerHTML = "<tr><td class=\"error\" colspan=\"10\">No data is available for this event right now.</td></tr>";
				return;
			}
			
			//Generate the graphs.
			createMatchGraph(); // v main.js
			createDistroGraph(); // v main.js
			
			//This sets up the match predictor.
			m2atchpredictionmode0.onchange = m2atchpredictionmode1.onchange = m2atchpredictionmode2.onchange = predictUnplayed;
			predictUnplayed(); // --> prediction.js
			
			//Here, the data tables are filled.		
			var colteam = [];
			var colrank = [];
			for (var i = 0; i < frcEvent.teamHash.size(); i++) {
				colrank[i] = i + 1;
				colteam[i] = frcEvent.rankHash.get(i+1);
			}
			
			// Big Table
			fillTable("bigtable", // --> output.js
				[colteam,	colrank,	frcEvent.autonEC,	frcEvent.climbEC,	frcEvent.teleopEC,	frcEvent.totalEC,	frcEvent.dpr,	frcEvent.ccwm,	(frcEvent.estimatedRankings || colrank)], 
				["grey",	"greenred",	"redgreen",			"redgreen",			"redgreen",			"redgreen",			"redgreen",		"redgreen",  	"greenred"],
				[0,			0,			1,					1,					1,					1,					1,				1,				0],
				true,	// Sortable?
				false,	// Use Global Extremes for Coloring?
				false);	// First Column is Header (bold it)?
			
				
			// Correlation Table
			fillTable("correlationtable", 
				[frcEvent.corrLabels,	frcEvent.corrMatrix[0],	frcEvent.corrMatrix[1],	frcEvent.corrMatrix[2],	frcEvent.corrMatrix[3],	frcEvent.corrMatrix[4],	frcEvent.corrMatrix[5],	frcEvent.corrMatrix[6], frcEvent.corrMatrix[7], frcEvent.corrMatrix[8]], 
				["grey",				"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen", "mirrorwhitegreen"],
				[0,						2,						2,						2,						2,						2,						2,						2,						2,	2],
				false,	// Sortable?
				true,	// Use Global Extremes for Coloring?
				true);	// First Column is Header (bold it)?

		}
	);
	//This finishes setting up match prediction.
	setupMatchPredictor();
}

function goToRankings(){
	if(!frcEvent) { return; };
	window.open("http://www2.usfirst.org/" + frcEvent.url + "rankings.html", "_self");
}

function goToSchedule(){
	if(!frcEvent) { return; };
	window.open("http://www2.usfirst.org/" + frcEvent.url + "matchresults.html", "_self");
}

var graphMatches;
var graphDistro;

function createMatchGraph(){
	var t = frcEvent.qualTable.data;
	var lowPts = [];
	var highPts = [];
	for (var i = 0; i < t.length; i++) {
		var x = i + 1;
		var y1 = t[i][9];
		var y2 = t[i][8];
		var lo = Math.min(y1,y2);
		var hi = Math.max(y1,y2);
		lowPts[lowPts.length] = [x,lo];
		highPts[highPts.length] = [x,hi ];
	}
	
	var movingHigh = new Array(highPts.length);
	var movingLow = new Array(lowPts.length);
	
	var movingLength = 10;
	
	for(var i = 0; i < highPts.length; i++){
		movingHigh[i] = 0;
		movingLow[i] = 0;
		for(var j = 0; j < movingLength; j++){
			if(i-j < 0) { continue; };
			movingHigh[i] += highPts[i-j][1];
			movingLow[i] += lowPts[i-j][1];
		}
		movingHigh[i] = [i,movingHigh[i]/Math.min(i+1,movingLength)];
		movingLow[i] = [i,movingLow[i]/Math.min(i+1,movingLength)];
	}
	plotAxis(graphMatches, 0, /*frcEvent.matchCount*/t.length, 0, 200, "", "", "",true,true,false); //Empty and true true for not doubling up text when I draw again.0.5;
	graphMatches.lines = 0.5;
	plotCurve(graphMatches,lowPts,"#9999EE",true);
	plotCurve(graphMatches,highPts,"#EE9999",true);
	graphMatches.lines = 0.75;
	plotCurve(graphMatches,movingHigh,"#CC5555",true);
	plotCurve(graphMatches,movingLow,"#5555CC",true);
	plotAxis(graphMatches, 0, t.length, 0, 200, "Match", "Score", "",false,false,true);
}

function generateApproximateDistribution(data) {
	function smooth(a,m) {
		var b = [];
		for (var i = 0; i < a.length; i++) {
			var s = 0;
			var w = 0;
			for (var j = 0; j < a.length; j++) {
				var p = Math.pow(m,Math.abs(a[j][0] - a[i][0]));
				w = w + p;
				s = s + p * a[j][1];
			}
			b.push([a[i][0],s/w]);
		}
		return b;
	}
	k = data;
	k.sort(function(a,b) { return a-b; });
	var integral = [];
	for (var i = 0; i < k.length; i++) {
		integral.push( [k[i] , (i-1) / (k.length-1)] );
	}
	integral = smooth(integral,0.5);
	var distribution = [];
	var cum = 0;
	var sum = 0;
	for (var i = 1; i < k.length; i++) {
		distribution.push([k[i] , (integral[i][1] - integral[i-1][1]) / (k[i] - k[i-1])   ]);
	}
	distr = smooth(distribution,0.2);
	distr.push([k[0],0]);
	distr.push([k[k.length-1],0]);
	return distr;
}

function createDistroGraph(){
	// Find Max/Min
	
	var winMin = frcEvent.totalEC.get(0,0);
	var winMax = frcEvent.totalEC.get(0,0);
	
	for(var i = 0; i < frcEvent.teamCount; i++){
		if(frcEvent.totalEC.get(i,0) > winMax){ winMax = frcEvent.totalEC.get(i,0); };
		if(frcEvent.totalEC.get(i,0) < winMin){ winMin = frcEvent.totalEC.get(i,0); };
		if(frcEvent.ccwm.get(i,0) > winMax){ winMax = frcEvent.ccwm.get(i,0); };
		if(frcEvent.ccwm.get(i,0) < winMin){ winMin = frcEvent.ccwm.get(i,0); };
	}
	
	winMax = Math.floor(winMax*0.11)*10;//roundPretty(winMax);
	winMin = Math.floor((winMin-Math.abs(winMin)*0.1)/10)*10;//roundPretty(winMin);
	
	// Total Points Stats
	var totalMu = mean(frcEvent.totalEC);
	var totalSigma = std(frcEvent.totalEC);
	var totalPts = normPDFRange(-100, 100, totalMu, totalSigma);
	var totalMaxPD = 0;
	
	for(var i = 0; i < totalPts.length; i++){
		if(totalPts[i][1] > totalMaxPD){ totalMaxPD = totalPts[i][1]; };
	}
	
	// CCWM Stats
	var ccwmMu = mean(frcEvent.ccwm);
	var ccwmSigma = std(frcEvent.ccwm);
	var ccwmPts = normPDFRange(-100, 100, ccwmMu, ccwmSigma);
	var ccwmMaxPD = 0;
	
	for(var i = 0; i < ccwmPts.length; i++){
		if(ccwmPts[i][1] > ccwmMaxPD){ ccwmMaxPD = ccwmPts[i][1]; };
	}
	
	// Plot
	plotAxis(graphDistro, winMin, winMax, 0, Math.max(totalMaxPD, ccwmMaxPD) * 1.1, "", "","",true,true,true); //empty titles and no ticks so we don't double up text.

	//Fancy calculus distribution?
	var k = [];
	for (var i = 0; i < frcEvent.teamCount; i++) {
		k.push( parseFloat(frcEvent.totalEC.get(i,0)) );
	}
	var distrOPR = generateApproximateDistribution(k);

	var k = [];
	for (var i = 0; i < frcEvent.teamCount; i++) {
		k.push( parseFloat(frcEvent.ccwm.get(i,0)) );
	}
	var distrCCWM = generateApproximateDistribution(k);

	//plotAxis(graphDistro,-5,80 , 0 , 0.03);
	graphDistro.lines = 0.5;
	plotCurve(graphDistro, distrOPR , "#EE9999" , true);

	graphDistro.lines = 0.5;
	plotCurve(graphDistro, distrCCWM , "#9999EE" , true);

	graphDistro.lines = 0.75;
	plotCurve(graphDistro, totalPts, "#CC5555", true);

	graphDistro.lines = 0.75;
	plotCurve(graphDistro, ccwmPts, "#5555CC", true);

	plotAxis(graphDistro, winMin, winMax, 0, Math.max(totalMaxPD, ccwmMaxPD) * 1.1, "Points", "Frequency","",false,true,true);
	
}
