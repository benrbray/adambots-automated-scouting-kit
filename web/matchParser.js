/**
 * MATCHPARSER.JS
 * Designed as the equivalent of MatchParser.java, which essentially holds data
 * and calculations for a single FIRST event.  It is responsible for requesting
 * and processing match data.
 * @author Ben Bray
 */

//// MATCH PARSER CONSTRUCTOR -------------------------------------------------

function MatchParser(rankingsURL, resultsURL){
	var mp = {type:"MatchParser"};
	
	// Fields
	mp.rankingsURL = rankingsURL;
	mp.resultsURL = resultsURL;
	
	// Methods
	mp.parse = function(onparsingcomplete) {
		mp.onparsingcomplete = onparsingcomplete;
		MatchParserBeginParse(mp);
	};
	
	// Return Match Parser
	return mp;
}

function MatchParserTypeCheck(mp){
	// Type Check
	if(!mp || !mp.type || !mp.type == "MatchParser"){
		throw "MatchParser :: Illegal Argument : mp is not of type 'MatchParser'";
	}
}

//// MATCH PARSER METHODS -----------------------------------------------------

function MatchParserBeginParse(mp){
	console.log("\t[MatchParserBeginParse] started");
	// Type Check
	MatchParserTypeCheck(mp);
	
	// Verify URL Existence
	if(!mp.rankingsURL || !mp.resultsURL){
		throw "MatchParserParse :: Undefined URL";
	}
	
	// Create Tables
	mp.resultsTable = Table(mp.resultsURL);
	mp.rankingsTable = Table(mp.rankingsURL);
	
	// Begin Loading Results
	MatchParserLoadResults(mp);
}

/**
 * Loads the Results Table, and afterwards either loads the rankings table or
 * proceeds to the MatchParserCompleteParse() method to perform calculations.
 * @mp The MatchParser object to use.
 */
function MatchParserLoadResults(mp){
	console.log("[MatchParserLoadResults] started");
	// Type Check
	MatchParserTypeCheck(mp);
	
	if(!mp.resultsTable.requestComplete){
		if(!mp.rankingsTable.requestComplete){
			mp.resultsTable.loadTable(function() { MatchParserLoadRankings(mp); });
		} else {
			mp.resultsTable.loadTable(MatchParserCompleteParse);
		}
	}
	console.log("[MatchParserLoadResults] success");
}

/**
 * Loads the Rankings Table, and afterwards either loads the results table or
 * proceeds to the MatchParserCompleteParse() method to perform calculations.
 * @mp The MatchParser object to use.
 */
function MatchParserLoadRankings(mp){
	console.log("[MatchParserLoadRankings] started");
	// Type Check
	MatchParserTypeCheck(mp);
	
	if(!mp.rankingsTable.requestComplete){
		if(!mp.resultsTable.requestComplete){
			mp.rankingsTable.loadTable(function() { MatchParserLoadResults(mp); });
		} else {
			mp.rankingsTable.loadTable(function() { MatchParserCompleteParse(mp); });
		}
	}
	console.log("[MatchParserLoadRankings] success");
}

/**
 * Completes the parsing process once all Tables have been successfully loaded.
 * @mp The MatchParser object to use.
 */
function MatchParserCompleteParse(mp){
	console.log("[MatchParserCompleteParse] started");
	// Type Check
	MatchParserTypeCheck(mp);
	
	// Get Table Data
	resultsBody = mp.resultsTable.getBody();
	rankingsBody = mp.rankingsTable.getBody();
	
	teamHash = mp.rankingsTable.constructColumnHash(1, 0);
	teamCount = teamHash.size();
	matchesTotal = mp.resultsTable.getRows();
	
	// Count Match Pair Frequencies
	mpf = zeros(teamCount, teamCount);
	
	for(var i = 0; i < matchesTotal; i++){
		if(resultsBody[8][i] == 0 && resultsBody[9][i] == 0) continue;
		for(var j = 2; j <= 4; j++){			// Select Row Team
			for(var k = j; k <= 4; k++){		// Select Column Team
				// Red Alliance
				var rowTeam = resultsBody[j][i];
				var rowTeamIndex = teamHash.get(rowTeam) - 1;
				var colTeam = resultsBody[k][i];
				var colTeamIndex = teamHash.get(colTeam) - 1;
				
				mpf[rowTeamIndex][colTeamIndex]++;
				if(colTeamIndex != rowTeamIndex) { mpf[colTeamIndex][rowTeamIndex]++; };
			
				// Blue Alliance
				rowTeam = resultsBody[j+3][i];
				colTeam = resultsBody[k+3][i];
				rowTeamIndex = teamHash.get(rowTeam) - 1;
				colTeamIndex = teamHash.get(colTeam) - 1;
				
				mpf[rowTeamIndex][colTeamIndex]++;
				if(colTeamIndex != rowTeamIndex) { mpf[colTeamIndex][rowTeamIndex]++; };
			}
		}
	}
	
	// Correct Diagonal Sum
	for(var i = 0; i < teamCount; i++){
		var sum = 0;
		for(var j = 0; j < teamCount; j++){
			if(i == j) continue;
			sum += mpf[j][i];
		}
		mpf[i][i] = sum / 2;
	}
	
	// Set Object Fields
	mp.resultsBody = resultsBody;
	mp.rankingsBody = rankingsBody;
	mp.teamHash = teamHash;
	mp.teamCount = teamCount;
	mp.matchesTotal = matchesTotal;
	mp.mpf = mpf;
	
	// Extract Point Values
	mp.autonPoints = new Array(teamCount);
	mp.climbPoints = new Array(teamCount);
	mp.teleopPoints = new Array(teamCount);
	mp.totalPoints = new Array(teamCount);
	
	for(var i = 0; i < teamCount; i++){
		mp.autonPoints[i] = parseInt(rankingsBody[3][i]);
		mp.climbPoints[i] = parseInt(rankingsBody[4][i]);
		mp.teleopPoints[i] = parseInt(rankingsBody[5][i]);
		mp.totalPoints[i] = mp.autonPoints[i] + mp.climbPoints[i] + mp.teleopPoints[i];
	}
	
	// Call 'onparsingcomplete'
	mp.onparsingcomplete.call();
}
