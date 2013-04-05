//// FRCEVENT -----------------------------------------------------------------

/**
 * Represents all of the pages and data necessary for all of the calculations
 * about an Event.
 * 
 * baseurl: e.g., 2013comp/Events/MIGBL
 * 
 * .pageRankings a Page for rankings.html
 * .pageMatches a Page for matchresults.html
 * 
 * .qualTable a Table for the qualification matches on matchresults.html (Will
 * 		be undefined if the competition is not begun)
 * .elimTable a Table for the elimination matches on matchresults.html (MAY BE
 *		UNDEFINED IF THEY HAVE NO YET BEGUN)
 * .rankingsTable a Table for the data on rankings.html
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
		this.autonEC = this.mpf.solveLU(this.autonPoints);
		this.climbEC = this.mpf.solveLU(this.climbPoints);
		this.teleopEC = this.mpf.solveLU(this.teleopPoints);
		this.totalEC = this.mpf.solveLU(this.totalPoints);

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
		this.ccwm = this.mpf.solveLU(this.winMargins);
		this.dpr = this.mpf.solveLU(this.defenceMargins);

		this.getCCWM = function(t) {
			return this.ccwm.get(this.teamHash.get(t)-1,0);
		}
		this.getDPR = function(t) {
			return this.dpr.get(this.teamHash.get(t)-1,0);
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

