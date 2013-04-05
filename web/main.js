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
	plotAxis(graphMatches,0,80,0,150,"Match","Score","");
	
	document.getElementById("oprdata").innerHTML = "<tr><td colspan=\"6\">Building FRCEvent object</td></tr>";
	frcEvent = new FRCEvent(eventURL, eventName, 
		function () {
			var t = frcEvent.qualTable.data;
			var pts = [];
			for (var i = 0; i < t.length; i++) {
				pts[pts.length] = [i+1, t[i][9] ];
			}
			plotCurve(graphMatches,pts,"#9999EE",true);
		}
	);
	
	setInterval( function() { 
		document.getElementById("oprdata").innerHTML = "<td colspan=\"6\">" + frcEvent.status + "</td>";
	}, 100);
}


var graphMatches;
