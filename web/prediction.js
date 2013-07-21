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

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//This is for convenience. It loads from the FRCEvent `even` the data.
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

//Also for convenience, this computes the value of a particular alliance under the current mode `m` and FRCEvent `e`.
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
	var qu2 = []; // Generate total match list, of both qualification and elimination matches
	for (var i = 0; i < frcEvent.qualTable.data.length; i++) {
		var u = frcEvent.qualTable.data[i].slice(0);
		u.name = "<b>Q" + u[1] + "</b>";
		qu2.push(u);
	}
	for (var i = 0; i < frcEvent.elimTable.data.length; i++) {
		var u = frcEvent.elimTable.data[i].slice(0);
		u.name = "<b>" + frcEvent.elimTable.raw[i][1].replace(" ","<br/>") + "</b>";
		u.remove(1);
		qu2.push(u);
	}
	qu = qu2;

	var colmatch = [];
	var finmatch = [];
	var colteams = [[],[]]//[[],[],[],[],[],[]];
	var finteams = [[],[]];
	var colscores = [[],[]];
	var finscores = [[],[]];
	var finscoresreal = [[],[]];

	for (var m = 0; m < qu.length; m++) {
		// Get Match (Row)
		var match = qu[m];
		
		// Tabulate
		if (isNaN(match[8])) {
			//Match has not been played.
			//colmatch.push("Q" + match[1]);	
			colmatch.push(qu[m].name);
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
			//finmatch.push("Q" + match[1]);	//<derivative from above>
			finmatch.push(qu[m].name);
			var redalli = match[2] + "&nbsp;&nbsp;" + match[3] + "&nbsp;&nbsp;" + match[4];
			var bluealli = match[5] + "&nbsp;&nbsp;" + match[6] + "&nbsp;&nbsp;" + match[7];
			var red = predictAllianceValue(match[2],match[3],match[4] , mode , frcEvent);
			var blue = predictAllianceValue(match[5],match[6],match[7] , mode , frcEvent);
			
			var op = "";
			var cp = "";
			if (red >= blue != parseInt(match[8]) >= parseInt(match[9])) {
				op = "<del>";
				cp = "</del>";
			}

			if (red > blue ) {
				// Prediction Table
				finscores[0].push( op + "" + red.toFixed(1) + "" + cp );
				finscores[1].push( op + blue.toFixed(1)  + cp );
			} else {
				// Prediction Table
				finscores[0].push( op + red.toFixed(1) + cp );
				finscores[1].push( op + "" + blue.toFixed(1) + "" + cp );
			}
			if (match[8] >= match[9]) {
				finscoresreal[0].push("<b>" + match[8] + "</b>");
				redalli = "<b>" + redalli + "</b>";
			} else {
				finscoresreal[0].push(match[8]);
			}
			if (match[9] >= match[8]) {
				finscoresreal[1].push("<b>" + match[9] + "</b>");
				bluealli = "<b>" + bluealli + "</b>";
			} else {
				finscoresreal[1].push(match[9]);
			}
			finteams[0].push(redalli);
			finteams[1].push(bluealli); //</derivative from above>
			for (var z = 0; z < 3; z++) {
				var red = predictAllianceValue(match[2],match[3],match[4] , z , frcEvent ); //The scores predicted by the current game model.
				var blue = predictAllianceValue(match[5],match[6],match[7] , z , frcEvent );
				var realRed = parseInt(match[8]); //The actual scores for this match reported by FIRST
				var realBlue = parseInt(match[9]);
				
				// Count Correct
				if ((red >= blue) == (realRed >= realBlue) ) {
					correct[z] = correct[z] + 1; //`z` refers to prediction mode, so this is done for all 3 here.
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
		document.getElementById("matchpredictions").tBodies[0].innerHTML = "<tr><td colspan=\"5\" class=\"error\">No unplayed matches are scheduled.</td></tr>";
	}

	if(finmatch.length > 0){
		// Played Matches Exist
		fillTable("matchresults", [finmatch , finteams[0], finteams[1], finscoresreal[0], finscoresreal[1], finscores[0], finscores[1] ], ["grey","white","white","red","blue","red","blue"] , [-1,-1,-1,-1,-1,-1,-1] );
	} else {
		// No played Matches
		document.getElementById("matchresults").tBodies[0].innerHTML = "<tr><td colspan=\"5\" class=\"error\">No matches have been played yet.</td></tr>";
	}
}