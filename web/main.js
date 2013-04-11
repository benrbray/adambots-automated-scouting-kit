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
	// Graph Context
	graphMatches = document.getElementById("graphMatches").getContext("2d");
	graphDistro = document.getElementById("graphDistro").getContext("2d");
	
	// Waiting Message
	document.getElementById("bigdata").innerHTML = "<tr><td colspan=\"8\">Waiting for data <em>FIRST</em>...</td></tr>";
	document.getElementById("correlationdata").innerHTML = "<tr><td colspan=\"9\">Waiting for data from <em>FIRST</em>...</td></tr>";
	
	// FRC Event
	frcEvent = new FRCEvent(eventURL, eventName, 
		function () {
			
			// Graph Match Score
			createMatchGraph();
			createDistroGraph();
			
			// Fill Tables			
			var colteam = [];
			var colrank = [];
			for (var i = 0; i < frcEvent.teamHash.size(); i++) {
				colrank[i] = i + 1;
				colteam[i] = frcEvent.rankHash.get(i+1);
			}
			
			fillTable("bigtable", 
				[colteam,	colrank,	frcEvent.autonEC,	frcEvent.climbEC,	frcEvent.teleopEC,	frcEvent.totalEC,	frcEvent.dpr,	frcEvent.ccwm], 
				["grey",	"greenred",	"redgreen",			"redgreen",			"redgreen",			"redgreen",			"redgreen",		"redgreen"],
				[0,			0,			1,					1,					1,					1,					1,				1],
				true,	// Sortable?
				false,	// Use Global Extremes for Coloring?
				false);	// First Column is Header (bold it)?
				
			fillTable("correlationtable", 
				[frcEvent.corrLabels,	frcEvent.corrMatrix[0],	frcEvent.corrMatrix[1],	frcEvent.corrMatrix[2],	frcEvent.corrMatrix[3],	frcEvent.corrMatrix[4],	frcEvent.corrMatrix[5],	frcEvent.corrMatrix[6], frcEvent.corrMatrix[7]], 
				["grey",				"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen",		"mirrorwhitegreen"],
				[0,						2,						2,						2,						2,						2,						2,						2,						2],
				false,	// Sortable?
				true,	// Use Global Extremes for Coloring?
				true);	// First Column is Header (bold it)?

			m2atchpredictionmode0.onchange = m2atchpredictionmode1.onchange = m2atchpredictionmode2.onchange = predictUnplayed;
			predictUnplayed();
		}
	);

	setupMatchPredictor();
}


var graphMatches;
var graphDistro;

function createMatchGraph(){
	var t = frcEvent.qualTable.data;
	var pts = [];
	for (var i = 0; i < t.length; i++) {
		pts[pts.length] = [i+1, t[i][9] ];
	}
	
	plotAxis(graphMatches, 0, frcEvent.matchCount, 0, 200, "", "", "",true,true,false); //Empty and true true for not doubling up text when I draw again.
	plotCurve(graphMatches,pts,"#9999EE",true);
	plotAxis(graphMatches, 0, frcEvent.matchCount, 0, 200, "Match", "Score", "",false,false,true);
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
	plotCurve(graphDistro, totalPts, "#EE9999", true);
	plotCurve(graphDistro, ccwmPts, "#9999EE", true);
	plotAxis(graphDistro, winMin, winMax, 0, Math.max(totalMaxPD, ccwmMaxPD) * 1.1, "Points", "Frequency","",false,true,true);
}
