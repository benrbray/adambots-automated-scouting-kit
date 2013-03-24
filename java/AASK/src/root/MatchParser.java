package root;

/**
 *
 * @author Curtis Fenner
 */
import java.io.*;
import java.net.URL;
import java.util.Hashtable;

import Jama.Matrix;

public class MatchParser {
	//// CONSTANTS ------------------------------------------------------------

	public static final String MATCH_RESULTS = "matchresults.html";
	public static final String TEAM_STANDINGS = "rankings.html";
	
	//// PRIVATE VARIABLES ----------------------------------------------------
	
	private int _teamCount;
	private int _matchesPlayed;
	private int _matchesTotal;
	
	private String _competitionURL;
	
	// Match Results
	private Table _matchResults;
	private Matrix _matchResultsMatrix;
	
	// Team Standings
	private Table _teamStandings;
	private Matrix _teamStandingsMatrix;
	
	// Hashtable
	private Hashtable<Integer, Integer> _teamHash;
	
	// Auxiliary Matrices
	private Matrix _matchPairFrequencies;
	private Matrix _autonPoints;
	private Matrix _climbPoints;
	private Matrix _teleopPoints;
	private Matrix _totalPoints;
	
	// Estimated Contributions
	private Matrix _autonContributions;
	private Matrix _climbContributions;
	private Matrix _teleopContributions;
	private Matrix _totalContributions;
	
	//// CONSTRUCTOR ----------------------------------------------------------
	
	public MatchParser(){
		
	}
	
	public MatchParser(String competitionURL){
		connect(competitionURL);
	}
	
	//// CONNECT --------------------------------------------------------------
	
	public void connect(String competitionURL){
		_competitionURL = competitionURL;
		parse();
	}
	
	//// PARSING --------------------------------------------------------------
	
	public void parse(){
		// Verify Arguments
		if(_competitionURL == null) throw new NullPointerException("MatchParser URL cannot be null.");
		
		// Parse
		_matchResults = new Table(_competitionURL + MATCH_RESULTS);
		_teamStandings = new Table(_competitionURL + TEAM_STANDINGS);
		
		// Construct Hashtable (Team # -> Rank)
		_teamHash = _teamStandings.constructColumnHash(1, 0);
		
		// Dataset Properties
		_teamCount = _teamHash.size();
		_matchesTotal = _matchResults.getRows();
		
		// Calculate Match Pair Frequencies
		double[][] mpf = new double[_teamCount][_teamCount];
		double[][] matchResultsBody = _matchResults.getBody();
		
		Matrix mrb = new Matrix(matchResultsBody);
		mrb.print(2, 0);
		
		for(int i = 0; i < _matchesTotal; i++){ 	// Matches
			if(matchResultsBody[8][i] == 0 && matchResultsBody[9][i] == 0) continue;
			for(int j = 2; j <= 4; j++){			// Select Row Team
				for(int k = j; k <= 4; k++){		// Select Column Team
					// Red Alliance
					int rowTeam = (int)matchResultsBody[j][i];
					int rowTeamIndex = _teamHash.get(rowTeam) - 1;
					int colTeam = (int)matchResultsBody[k][i];
					int colTeamIndex = _teamHash.get(colTeam) - 1;
					
					mpf[rowTeamIndex][colTeamIndex]++;
					mpf[colTeamIndex][rowTeamIndex]++;
				
					// Blue Alliance
					rowTeam = (int)matchResultsBody[j+3][i];
					colTeam = (int)matchResultsBody[k+3][i];
					rowTeamIndex = _teamHash.get(rowTeam) - 1;
					colTeamIndex = _teamHash.get(colTeam) - 1;
					
					mpf[rowTeamIndex][colTeamIndex]++;
					mpf[colTeamIndex][rowTeamIndex]++;
				}
			}
		}
		
		for(int i = 0; i < _teamCount; i++){
			int sum = 0;
			for(int j = 0; j < _teamCount; j++){
				if(i == j) continue;
				sum += mpf[j][i];
			}
			mpf[i][i] = sum / 2;
		}
		
		_matchPairFrequencies = new Matrix(mpf);
		
		// Extract Point Values
		_teamStandingsMatrix = new Matrix(_teamStandings.getBody()).transpose();
		_teamStandingsMatrix.print(3, 0);
		_autonPoints = _teamStandingsMatrix.getMatrix(0,39,3,3);
		_climbPoints = _teamStandingsMatrix.getMatrix(0,39,4,4);
		_teleopPoints = _teamStandingsMatrix.getMatrix(0,39,5,5);
		_totalPoints = _autonPoints.plus(_climbPoints.plus(_teleopPoints));
	}
	
	//// GETTER / SETTER METHODS ----------------------------------------------
        
        public Matrix getTeamStandingsMatrix() {
            return this._teamStandingsMatrix;
        }
	
	public Hashtable getTeamHash(){
		return _teamHash;
	}
	
	public int getTeamCount(){
		return _teamCount;
	}
	
	public Table getMatchResults(){
		return _matchResults;
	}
	
	public Table getTeamStandings(){
		return _teamStandings;
	}
	
	public Matrix getAutonPoints(){
		return _autonPoints;
	}
	
	public Matrix getClimbPoints(){
		return _climbPoints;
	}
	
	public Matrix getTeleopPoints(){
		return _teleopPoints;
	}
	
	public Matrix getTotalPoints(){
		return _totalPoints;
	}
	
	public Matrix getAutonContributions(){
		if(_autonContributions != null) return _autonContributions;
		else return (_autonContributions = _matchPairFrequencies.solve(_autonPoints));
	}
	
	public Matrix getClimbContributions(){
		if(_climbContributions != null) return _climbContributions;
		else return (_climbContributions = _matchPairFrequencies.solve(_climbPoints));
	}
	
	public Matrix getTeleopContributions(){
		if(_teleopContributions != null) return _teleopContributions;
		else return (_teleopContributions = _matchPairFrequencies.solve(_teleopPoints));
	}
	
	public Matrix getTotalContributions(){
		if(_totalContributions != null) return _totalContributions;
		else return (_totalContributions = _matchPairFrequencies.solve(_totalPoints));
	}
	
}