



//// JAVASCRIPT-Y STUFF BELOW -------------------------------------------------

var pageMatches;
var pageRankings;


function waitForData() {
  if (pageMatches.ready && pageRankings.ready) {
		document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\"><em>Data ready; computing.</em></td></tr>";
	} else {
		setTimeout(waitForData,100);
	}
}

/**
 * Synch call so that the page doesn't freeze when it starts;
 * reduces page load time at the cost of causing a "waiting for data" message
 * to be displayed for a second.
 */
function Main() {
	console.log("[Main] started");
	
	// Display Waiting Message
	document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
	
	pageRankings = new Page(rankingsPage); //Generate the table for Rankings
	pageMatches = new Page(resultsPage); //Generate the table for the match results
	waitForData(); //Go to "waitForData" while the pages are loading.
}
