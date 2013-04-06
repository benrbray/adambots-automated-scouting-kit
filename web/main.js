var pageMatches;
var pageRankings;

/**
 * Repeatedly occurs until both pageMatches and pageRankings report that they have finished scraping and parsing.
 * Then, inside the "if" , the remainder of processing may continue. Might want to move this inside of the FRC event?
 */

/**
 * Initial table text is "waiting for scripts" so this modifies it to state "waiting for data".
 * Create the Page objects necessary for the event (to be encapsulated by an FRCEvent object).
 * Start waiting for the scrape and parse to finish at "waitForData()".
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
	/*setInterval( function() { 
		document.getElementById("contributiondata").innerHTML = "<td colspan=\"8\">" + frcEvent.status + "</td>";
	}, 100);*/
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
	// Prepare Data
	totalMu = mean(frcEvent.totalEC);
	totalSigma = std(frcEvent.totalEC);
	totalPts = normPDFRange(0, 100, totalMu, totalSigma);
	totalMax = 0;
	
	for(var i = 0; i < totalPts.length; i++){
		if(totalPts[i][1] > totalMax){ totalMax = totalPts[i][1]; };
	}
	
	ccwmMu = mean(frcEvent.ccwm);
	ccwmSigma = std(frcEvent.ccwm);
	ccwmPts = normPDFRange(0, 100, ccwmMu, ccwmSigma);
	ccwmMax = 0;
	for(var i = 0; i < ccwmPts.length; i++){
		if(ccwmPts[i][1] > ccwmMax){ ccwmMax = ccwmPts[i][1]; };
	}
	
	// Plot
	plotAxis(graphDistro, 0, 100, 0, Math.max(totalMax, ccwmMax) * 1.1, "", "","",true,true,true); //empty titles and no ticks so we don't double up text.
	plotCurve(graphDistro, totalPts, "#EE9999", true);
	plotCurve(graphDistro, ccwmPts, "#9999EE", true);
	plotAxis(graphDistro, 0, 100, 0, Math.max(totalMax, ccwmMax) * 1.1, "Points", "Frequency","",false,true,true);
}
