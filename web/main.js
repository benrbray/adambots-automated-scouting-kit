


//// JAVASCRIPT-Y STUFF BELOW -------------------------------------------------

var pageMatches;
var pageRankings;

/**
 * Repeatedly occurs until both pageMatches and pageRankings report that they have finished scraping and parsing.
 * Then, inside the "if" , the remainder of processing may continue. Might want to move this inside of the FRC event?
 */
function waitForData() {
  if (pageMatches.ready && pageRankings.ready) {
		document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\"><em>Data ready; computing.</em></td></tr>";
	} else {
		setTimeout(waitForData,100);
	}
}

/**
 * Initial table text is "waiting for scripts" so this modifies it to state "waiting for data".
 * Create the Page objects necessary for the event (to be encapsulated by an FRCEvent object).
 * Start waiting for the scrape and parse to finish at "waitForData()".
 */
function Main() {
	console.log("[Main] started");
	
	// Display Waiting Message
	document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
	
	pageRankings = new Page(rankingsPage); //Generate the table for Rankings
	pageMatches = new Page(resultsPage); //Generate the table for the match results
	waitForData(); //Go to "waitForData" while the pages are loading.
}
