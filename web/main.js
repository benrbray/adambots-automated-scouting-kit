
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
 var frcevent;
function Main() {
	
	// Display Waiting Message
	
	graphMatches = document.getElementById("graphMatches").getContext("2d");
	
	document.getElementById("oprdata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
	frcevent = new FRCEvent(eventURL,eventName);
	setInterval( function() { 
		document.getElementById("oprdata").innerHTML = "<td colspan=\"6\">" + frcevent.status + "</td>";
	}, 1  );
}


var graphMatches;