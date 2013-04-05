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
	// Display Waiting Message
	graphMatches = document.getElementById("graphMatches").getContext("2d");
	
	document.getElementById("bigdata").innerHTML = "<tr><td colspan=\"8\">Building FRCEvent object</td></tr>";
	frcEvent = new FRCEvent(eventURL, eventName, 
		function () {
			var t = frcEvent.qualTable.data;
			var pts = [];
			for (var i = 0; i < t.length; i++) {
				pts[pts.length] = [i+1, t[i][9] ];
			}
			plotAxis(graphMatches, 0, frcEvent.qualTable.raw.length, 0, 200, "Match","Score","");
			plotCurve(graphMatches,pts,"#9999EE",true);
			
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
				true);

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
