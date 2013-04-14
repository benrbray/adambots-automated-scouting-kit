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

//// FRCEVENT -----------------------------------------------------------------

/**
 * Represents all of the pages and data necessary for all of the calculations
 * about an Event.
 * 
 * @param baseurl Event URL, e.g., 2013comp/Events/MIGBL
 * @param eventName The name of the event, e.g. "Grand Blanc District"
 * @param callback The function to call on completion of parsing and calculations.
 * 
 * Fields:
 * #pageRankings a Page object for /rankings.html
 * #pageMatches a Page object for /matchresults.html
 * #qualTable a Table object for the qualification matches on matchresults.html (Will
 * 		be undefined if the competition is not begun)
 * #elimTable a Table for the elimination matches on matchresults.html (MAY BE
 *		UNDEFINED IF THEY HAVE NO YET BEGUN)
 * #rankingsTable a Table for the data on rankings.html
 **/
function FRCEvent(baseurl,eventName,callback) {
	// Initialize Fields
	this.type = "FRCEvent";
	this.callback = callback;
	this.url = baseurl;
	this.eventName = eventName;
	this.status = "Downloading data.";
	this.pageRankings = new Page(baseurl + "rankings.html"); //Generate the table for Rankings
	this.pageMatches = new Page(baseurl + "matchresults.html"); //Generate the table for the match results
	
	// Define Methods
	var me = this;
	this.waitForData = function() {
		//Me is used instead of "this" because this function is called via setTimeout.
		//That means "this" is the window.
		//Apparently, "public" calls that I make to the object (me) get their "this" back though, so the rest uses normal "this".
		if (me.pageMatches.ready && me.pageRankings.ready) {
			me.status = "Data collected. Preparing for processing.";
			me.prepare();
		} else {
			setTimeout(me.waitForData,100);
		}
	}
	
	/**
	 * Do surface level processing: getting all of the tables set up and things.
	 * Then, move on to "process()".
	 **/
	this.prepare = function() {
		// Extract  Tables from Pages
		this.qualTable = this.pageMatches.tables[0];
		this.elimTable = this.pageMatches.tables[1];
		this.rankingsTable = this.pageRankings.tables[0];
		
		if (!this.qualTable) {
			this.failed = true;
			this.callback();
			return;
		}
		
		// Convert Tables to Matrices
		this.qualMatrix = new Matrix(this.qualTable.data);
		this.elimMatrix = (this.elimTable?new Matrix(this.elimTable.data):null);
		this.rankingsMatrix = new Matrix(this.rankingsTable.data);
		
		// Misc Stats
		this.teamHash = this.rankingsMatrix.columnHash(1, 0);
		this.teamCount = this.rankingsMatrix.getRows();
		this.rankHash = this.rankingsMatrix.columnHash(0, 1);
		this.matchCount = this.qualMatrix.getRows();
		
		this.process();
	}
	
	/**
	 * Do all computations here, including building matricies and things.
	 * Output NOTHING. Just provide data outlets.
	 **/
	this.process = function() {
		this.status = "Processing data.";
		
		// Create Necessary Matrices
		this.createMPF();
		this.createPointMatrices();
		
		// Solve the System
		var singularWarning = "Warning:  It appears that not enough matches have been played to yield reliable results.  The displayed solution is a \"best guess\", use additional discretion when interpreting results.";
		
		// LU Decomposition
		var LU = this.mpf.luSeparate();
		var L = LU[0];
		var U = LU[1];
		
		// Return Iterative Approximation if Singular
		var det = L.diagProduct() * U.diagProduct();
		
		if(isNaN(det) || det==0 || this.matchCount < (this.teamCount/2)){
			alert(singularWarning);
			this.autonEC = this.mpf.gaussSeidel(this.autonPoints);
			this.climbEC = this.mpf.gaussSeidel(this.climbPoints);
			this.teleopEC = this.mpf.gaussSeidel(this.teleopPoints);
			this.totalEC = this.mpf.gaussSeidel(this.totalPoints);
		} else {
			this.autonEC = MatrixSolveLUPrefactorized(L, U, this.autonPoints);
			this.climbEC = MatrixSolveLUPrefactorized(L, U, this.climbPoints);
			this.teleopEC = MatrixSolveLUPrefactorized(L, U, this.teleopPoints);
			this.totalEC = MatrixSolveLUPrefactorized(L, U, this.totalPoints);
		}

		// Define Helper Functions
		this.isTeam = function(t) {
			return this.teamHash.get(t) != undefined;
		}
		this.getAutonEC = function(t) {
			return this.autonEC.get(this.teamHash.get(t)-1,0);
		}
		this.getClimbEC = function(t) {
			return this.climbEC.get(this.teamHash.get(t)-1,0);
		}
		this.getTeleopEC = function(t) {
			return this.teleopEC.get(this.teamHash.get(t)-1,0);
		}
		this.getTotalEC = function(t) {
			return this.totalEC.get(this.teamHash.get(t)-1,0);
		}
		
		// Win Analysis
		this.winAnalysis();
		this.ccwm = this.mpf.gaussSeidel(this.winMargins);
		this.dpr = this.mpf.gaussSeidel(this.defenceMargins);

		this.getCCWM = function(t) {
			return this.ccwm.get(this.teamHash.get(t)-1,0);
		}
		this.getDPR = function(t) {
			return this.dpr.get(this.teamHash.get(t)-1,0);
		}
		
		// Estimated Rank
		this.predictedWinCounts = zeros(this.teamCount, 1);
		var qu = this.qualTable.data;
		for (var m = 0; m < this.matchCount; m++) {
			// Get Match (Row)
			var match = qu[m];
			var played = !isNaN(match[8]);
			
			// Predict Scores
			var red = played ? match[8] : predictAllianceValue(match[2], match[3], match[4] , 1 , frcEvent);
			var blue = played ? match[9] : predictAllianceValue(match[5], match[6], match[7] , 1 , frcEvent);
			
			if(red > blue){
				for(var i = 0; i < 3; i++){
					this.predictedWinCounts.plus(this.teamHash.get(match[2 + i])-1, 0, 2);
				}
			} else if(blue > red) {
				for(var i = 0; i < 3; i++){
					this.predictedWinCounts.plus(this.teamHash.get(match[5 + i])-1, 0, 2);
				}
			} else {
				for(var i = 0; i < 6; i++){
					this.predictedWinCounts.plus(this.teamHash.get(match[2 + i])-1, 0, 1);
				}
			}
		}
		
		var teamIndecies = this.rankingsMatrix.submat(0, this.teamCount-1, 0, 0).getData();
		var me = this;
		teamIndecies.sort(function(indexA, indexB){
			var order = new Array(me.predictedWinCounts, me.autonEC, me.climbEC, me.teleopEC);
			for(var i = 0; i < order.length; i++){
				var a = order[i].get(indexA-1, 0);
				var b = order[i].get(indexB-1, 0);
				if(a != b){
					return b-a;
				}
			}
			return indexB - indexA;
		});
		
		this.estimatedRankings = zeros(this.teamCount, 1);
		for(var i = 0; i < this.teamCount; i++){
			this.estimatedRankings.set(teamIndecies[i]-1, 0, i+1);
		}
		
		// Correlation
		this.corrVars = [this.rankingsMatrix.submat(0,this.teamCount-1,1,1),
						 this.rankingsMatrix.submat(0,this.teamCount-1,0,0),
						 this.autonEC,
						 this.climbEC,
						 this.teleopEC,
						 this.totalEC,
						 this.dpr,
						 this.ccwm,
						 this.estimatedRankings];
		this.corrLabels = ["Team", "Rank", "Auton", "Climb", "Teleop", "OPR", "DPR", "CCWM", "Seed"];
		this.corrMatrix = new Array(this.corrLabels.length);
						 
		for(var i = 0; i < this.corrVars.length; i++){
			this.corrMatrix[i] = zeros(this.corrLabels.length);
			for(var j = 0; j < this.corrVars.length; j++){
				var r = correlation(this.corrVars[i], this.corrVars[j]);
				this.corrMatrix[i].set(j,0,r);
			}
		}
		
		// Exit
		this.ready = true;
		if (this.callback) {
			this.callback(this);
		}
	}
	
	/**
	 * Generate Match Pair Frequency Matrix
	 */
	this.createMPF = function(){
		this.mpf = zeros(this.teamCount, this.teamCount);
		
		// Loop Through Matches
		for(var i = 0; i < this.matchCount; i++){
			// Check for Unplayed Matches
			if((isNaN(this.qualMatrix.get(i, 8)) || isNaN(this.qualMatrix.get(i, 9)))
			|| (this.qualMatrix.get(i, 8) == 0 && this.qualMatrix.get(i, 9) == 0)) continue;
			
			// Count
			for(var j = 2; j <= 4; j++){			// Select Row Team
				for(var k = j; k <= 4; k++){		// Select Column Team
					// Red Alliance
					var rowTeam = this.qualMatrix.get(i, j);
					var colTeam = this.qualMatrix.get(i, k);
					var rowTeamIndex = this.teamHash.get(rowTeam) - 1;
					var colTeamIndex = this.teamHash.get(colTeam) - 1;
					
					this.mpf.increment(rowTeamIndex, colTeamIndex);
					if(colTeamIndex != rowTeamIndex) { this.mpf.increment(colTeamIndex, rowTeamIndex); };

					// Blue Alliance
					rowTeam = this.qualMatrix.get(i, j + 3);
					colTeam = this.qualMatrix.get(i, k + 3);
					rowTeamIndex = this.teamHash.get(rowTeam) - 1;
					colTeamIndex = this.teamHash.get(colTeam) - 1;

					this.mpf.increment(rowTeamIndex, colTeamIndex);
					if(colTeamIndex != rowTeamIndex) { this.mpf.increment(colTeamIndex, rowTeamIndex); };
				}
			}
		}

		// Correct Diagonal Sum
		for(var i = 0; i < this.teamCount; i++){
			var sum = 0;
			for(var j = 0; j < this.teamCount; j++){
				if(i == j) continue;
				sum += this.mpf.get(i, j);
			}
			this.mpf.set(i, i, sum / 2);
		}
	}
	
	/**
	 * Extract Autonomous, Climb, Teleop, and Total point values  from the
	 * qualification Matrix.
	 */
	this.createPointMatrices = function(){
		// Raw Points
		this.autonPoints = this.rankingsMatrix.submat(0, this.teamCount-1, 3, 3);
		this.climbPoints = this.rankingsMatrix.submat(0, this.teamCount-1, 4, 4);
		this.teleopPoints = this.rankingsMatrix.submat(0, this.teamCount-1, 5, 5);
		this.totalPoints = this.autonPoints.add(this.climbPoints.add(this.teleopPoints));
	}
	
	/**
	 * Calculates and sums the total win margin for each team.  Note that this
	 * number is negative when a team loses!
	 */
	this.winAnalysis = function(){
		// Create Matrices
		this.winMargins = zeros(this.teamCount, 1);
		this.defenceMargins = zeros(this.teamCount, 1);
		
		// Loop Through Matches
		for(var i = 0; i < this.matchCount; i++){
			// Check for Unplayed Matches
			if((isNaN(this.qualMatrix.get(i, 8)) || isNaN(this.qualMatrix.get(i, 9)))
			|| (this.qualMatrix.get(i, 8) == 0 && this.qualMatrix.get(i, 9) == 0)) continue;
			
			// Get Teams
			var red1 = this.qualMatrix.get(i, 2);
			var red2 = this.qualMatrix.get(i, 3);
			var red3 = this.qualMatrix.get(i, 4);
			var blue1 = this.qualMatrix.get(i, 5);
			var blue2 = this.qualMatrix.get(i, 6);
			var blue3 = this.qualMatrix.get(i, 7);
			var redA = this.teamHash.get(red1) - 1;
			var redB = this.teamHash.get(red2) - 1;
			var redC = this.teamHash.get(red3) - 1;
			var blueA = this.teamHash.get(blue1) - 1;
			var blueB = this.teamHash.get(blue2) - 1;
			var blueC = this.teamHash.get(blue3) - 1;
			
			// Get Scores
			var redScore = this.qualMatrix.get(i, 8);
			var blueScore = this.qualMatrix.get(i, 9);
			var redExpected = this.getTotalEC(red1) + this.getTotalEC(red2) + this.getTotalEC(red3);
			var blueExpected = this.getTotalEC(blue1) + this.getTotalEC(blue2) + this.getTotalEC(blue3);
			
			// Calculate Margins
			var redRealMargin = redScore - blueScore;
			var blueRealMargin = blueScore - redScore;
			var redExpectedMargin = redExpected - blueExpected;
			var blueExpectedMargin = blueExpected - redExpected;
			var redDifference = redRealMargin - redExpectedMargin;
			var blueDifference = blueRealMargin - blueExpectedMargin;
			
			// Win Margin Matrix (Real)
			this.winMargins.plus(redA, 0, redRealMargin);
			this.winMargins.plus(redB, 0, redRealMargin);
			this.winMargins.plus(redC, 0, redRealMargin);
			this.winMargins.plus(blueA, 0, blueRealMargin);
			this.winMargins.plus(blueB, 0, blueRealMargin);
			this.winMargins.plus(blueC, 0, blueRealMargin);
			
			// Defense Margins (Opponent Real - Opponent Expected)
			this.defenceMargins.plus(redA, 0, blueDifference);
			this.defenceMargins.plus(redB, 0, blueDifference);
			this.defenceMargins.plus(redC, 0, blueDifference);
			this.defenceMargins.plus(blueA, 0, redDifference);
			this.defenceMargins.plus(blueB, 0, redDifference);
			this.defenceMargins.plus(blueC, 0, redDifference);
			
			// Win Frequency Matrix
		}
	}
	
	setTimeout(this.waitForData, 100);
}

