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
			
			var colteam = [];
			var colrank = [];
			for (var i = 0; i < frcEvent.teamHash.size(); i++) {
				colrank[i] = i + 1;
				colteam[i] = frcEvent.rankHash.get(i+1);
			}

			fillTable("oprtable", 
				[colteam	,colrank	,frcEvent.autonEC	,frcEvent.climbEC	,frcEvent.teleopEC	,frcEvent.totalEC], 
				["grey"		,"greenred"	,"redgreen"			,"redgreen"			,"redgreen"			,"redgreen"],
				[0			,0			,2],
				true);
			
		}
	);
	
	predictionred1.onchange = predictionred2.onchange = predictionred3.onchange = predictionblue1.onchange = predictionblue2.onchange = predictionblue3.onchange = 
	predictionred1.onkeyup = predictionred2.onkeyup = predictionred3.onkeyup = predictionblue1.onkeyup = predictionblue2.onkeyup = predictionblue3.onkeyup =
	function() {
		if (!frcEvent.ready) {
			return;
		}

		style = function(obj) {
	
			var k = obj.value.trim();
			k = parseInt(k);
			if (frcEvent.teamHash.get(k)) {
				obj.style.fontWeight = "bold";
			} else {
				obj.style.fontWeight = "normal";
			}
		}
		style(predictionred1);
		style(predictionred2);
		style(predictionred3);
		style(predictionblue1);
		style(predictionblue2);
		style(predictionblue3);

		var red = 0;
		if (frcEvent.isTeam(parseInt(predictionred1.value.trim()))) {
			red += frcEvent.getTotalEC(parseInt(predictionred1.value.trim()));
		}
		if (frcEvent.isTeam(parseInt(predictionred2.value.trim()))) {
			red += frcEvent.getTotalEC(parseInt(predictionred2.value.trim()));
		}
		if (frcEvent.isTeam(parseInt(predictionred3.value.trim()))) {
			red += frcEvent.getTotalEC(parseInt(predictionred3.value.trim()));
		}
		redallianceprediction.value = red.toFixed(2);
		if (red == 0) {
			redallianceprediction.value = "";
		}

		var blu = 0;
		if (frcEvent.isTeam(parseInt(predictionblue1.value.trim()))) {
			blu += frcEvent.getTotalEC(parseInt(predictionblue1.value.trim()));
		}
		if (frcEvent.isTeam(parseInt(predictionblue2.value.trim()))) {
			blu += frcEvent.getTotalEC(parseInt(predictionblue2.value.trim()));
		}
		if (frcEvent.isTeam(parseInt(predictionblue3.value.trim()))) {
			blu += frcEvent.getTotalEC(parseInt(predictionblue3.value.trim()));
		}
		blueallianceprediction.value = blu.toFixed(2);
		if (blu == 0) {
			blueallianceprediction.value = "";
		}
		
		if (Math.abs(blu - red) < 1) {
			predictedresult.innerHTML = "Tie in expected contribution.";
		}
		if (blu > red + 1) {
			predictedresult.innerHTML = "Blue wins by an expected " + (blu - red).toFixed(1) + " points.";
		}
		if (red > blu + 1) {
			predictedresult.innerHTML = "Red wins by an expected " + (red-blu).toFixed(1) + " points.";
		}

	}

	/*setInterval( function() { 
		document.getElementById("oprdata").innerHTML = "<td colspan=\"6\">" + frcEvent.status + "</td>";
	}, 100);*/
}


var graphMatches;
