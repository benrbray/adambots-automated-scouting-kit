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

/**
Mode:
0: Only OPR
1: OPR + DRP
2: CCWM
**/
function predictTeamValue(team,mode,even) {
	team = parseInt("" + team);
	if (!even.isTeam(team)) {
		return 0;
	}
	if (mode == 2) {
		return even.getCCWM(team);
	}
	if (mode == 1) {
		return even.getTotalEC(team) + Math.max(0,even.getDPR(team));
	}
	if (mode == 0) {
		return even.getTotalEC(team);
	}
}

function predictAllianceValue(t1,t2,t3,m,e) {
	return predictTeamValue(t1,m,e) + predictTeamValue(t2,m,e) + predictTeamValue(t3,m,e);
}

function setupMatchPredictor() {
	predictionred1.onchange = predictionred2.onchange = predictionred3.onchange = predictionblue1.onchange = predictionblue2.onchange = predictionblue3.onchange = 
	predictionred1.onkeyup = predictionred2.onkeyup = predictionred3.onkeyup = predictionblue1.onkeyup = predictionblue2.onkeyup = predictionblue3.onkeyup =
	m1atchpredictionmode1.onchange = m1atchpredictionmode0.onchange = m1atchpredictionmode2.onchange = function() {

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

		var mode = 0;
		if (m1atchpredictionmode1.checked) {
			mode = 1;
		}
		if (m1atchpredictionmode2.checked) {
			mode = 2;
		}

		var red = predictAllianceValue(predictionred1.value,predictionred2.value,predictionred3.value,mode,frcEvent);

		redallianceprediction.value = red.toFixed(2);
		if (red == 0) {
			redallianceprediction.value = "";
		}

		var blue = predictAllianceValue(predictionblue1.value,predictionblue2.value,predictionblue3.value,mode,frcEvent);


		blueallianceprediction.value = blue.toFixed(2);
		if (blue == 0) {
			blueallianceprediction.value = "";
		}
		
		if (Math.abs(blue - red) < 1) {
			predictedresult.innerHTML = "Expected near tie.";
		}
		if (blue > red + 1) {
			predictedresult.innerHTML = "Blue wins" + (mode==2 ? "." : " by an expected " + (blue - red).toFixed(1) + " points.");
		}
		if (red > blue + 1) {
			predictedresult.innerHTML = "Red wins" + (mode==2 ? "." : " by an expected " + (red-blue).toFixed(1) + " points.");
		}

	}
}

function predictUnplayed() {
	var mode = 0;
	if (m2atchpredictionmode1.checked) {
		mode = 1;
	}
	if (m2atchpredictionmode2.checked) {
		mode = 2;
	}
	//Rebuild the datatata.
	//console.log(frcEvent.qualTable.data);
	var correct = [0,0,0];
	var counted = 0;
	var qu = frcEvent.qualTable.data;

	var colmatch = [];
	var colteams = [[],[]]//[[],[],[],[],[],[]];
	var colscores = [[],[]];

	for (var m = 0; m < qu.length; m++) {
		// Get Match (Row)
		var match = qu[m];
		
		// Tabulate
		if (isNaN(match[8])) {
			//Match has not been played.
			colmatch.push("Q" + match[1]);
			
			var redalli = match[2] + "&nbsp;&nbsp;" + match[3] + "&nbsp;&nbsp;" + match[4];
			var bluealli = match[5] + "&nbsp;&nbsp;" + match[6] + "&nbsp;&nbsp;" + match[7];
			var red = predictAllianceValue(match[2],match[3],match[4] , mode , frcEvent);
			var blue = predictAllianceValue(match[5],match[6],match[7] , mode , frcEvent);
			
			if (red > blue ) {
				// Prediction Table
				colscores[0].push( "<b>" + red.toFixed(1) + "</b>" );
				colscores[1].push( blue.toFixed(1) );
				redalli = "<b>" + redalli + "</b>";
			} else {
				// Prediction Table
				colscores[0].push( red.toFixed(1) );
				colscores[1].push( "<b>" + blue.toFixed(1) + "</b>" );
				bluealli = "<b>" + bluealli + "</b>";
			}

			colteams[0].push(redalli);
			colteams[1].push(bluealli);
		} else {
			//Match has been played.
			for (var z = 0; z < 3; z++) {
				var red = predictAllianceValue(match[2],match[3],match[4] , z , frcEvent );
				var blue = predictAllianceValue(match[5],match[6],match[7] , z , frcEvent );
				var realRed = parseInt(match[8]);
				var realBlue = parseInt(match[9]);
				
				// Count Correct
				if ((red >= blue) == (realRed >= realBlue) ) {
					correct[z] = correct[z] + 1;
				}
			}
			counted = counted + 1;
		}
	}


	m2ode0acc.innerHTML = Math.floor(100 * correct[0]/counted) + "% accuracy";
	m2ode1acc.innerHTML = Math.floor(100 * correct[1]/counted) + "% accuracy";
	m2ode2acc.innerHTML = Math.floor(100 * correct[2]/counted) + "% accuracy";

	if(colmatch.length > 0){
		// Unplayed Matches Exist
		fillTable("matchpredictions", [colmatch , colteams[0], colteams[1], colscores[0], colscores[1] ], ["grey","white","white","red","blue"] , [-1,-1,-1,-1,-1] );
	} else {
		// No Unplayed Matches
		document.getElementById("matchpredictions").tBodies[0].innerHTML = "<tr><td colspan=\"5\" class=\"error\">No unplayed qualification matches scheduled.</td></tr>";
	}

	var fi = frcEvent.elimTable;
	if (!fi || fi.data.length == 0) {
		document.getElementById("matchpredictions").tBodies[0].innerHTML += "<tr><td colspan=\"5\" class=\"error\">No elimination matches are scheduled.</td></tr>";
	} else {
		var cname = [];
		var cred = [];
		var cblue = [];
		var csr = [];
		var csb = [];
		for (var m = 0; m < fi.data.length; m++) {
			var k = fi.data[m];
			if (isNaN(k[9])) {
				cname.push(fi.raw[m][1]);
				var a = k[3];
				var b = k[4];
				var c = k[5];
				var d = k[6];
				var e = k[7];
				var f = k[8];

				var redscore = predictAllianceValue(a,b,c,mode,frcEvent);
				var bluescore = predictAllianceValue(d,e,f,mode,frcEvent);
				if (redscore > bluescore) {
					cred.push("<b>" + a + "&nbsp;&nbsp;" + b + "&nbsp;&nbsp;" + c + "</b>");
					cblue.push(d + "&nbsp;&nbsp;" + e + "&nbsp;&nbsp;" + f);
					csr.push( "<b>" + redscore.toFixed(1) + "</b>" );
					csb.push( bluescore.toFixed(1)  );
				} else {
					cred.push(a + "&nbsp;&nbsp;" + b + "&nbsp;&nbsp;" + c);
					cblue.push("<b>" + d + "&nbsp;&nbsp;" + e + "&nbsp;&nbsp;" + f + "</b>");
					csr.push( redscore.toFixed(1)  );
					csb.push( "<b>" + bluescore.toFixed(1)  + "</b>" );
				}
			}
		}
		if (cname.length == 0) {
			document.getElementById("matchpredictions").tBodies[0].innerHTML += "<tr><td colspan=\"5\"  class=\"error\">No unplayed eliminations matches are scheduled.</td></tr>";
		} else {
			fillTable("matchpredictions", [cname,cred,cblue,csr,csb] , ["grey","white","white","red","blue"],[-1,-1,-1,-1,-1] );
		}
	}
}