<?php
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


//(The relevant PHP / HTML code to make this run)
/*
This is the only server-side work done.
Loading a page from WW2.USFIRST.ORG violates the same-origin policy.
Instead, this pages acts a proxy, so same-origin isn't violated.
*/

function directory() {
	//bloginfo("template_directory");
	//echo "/Scouting/";
}


if (isset($_REQUEST["grab"])) {
	$req = $_REQUEST["grab"];
	function isamatchuri($m) {
		return sizeof(explode("matchresults",$m),2) == 2;
	}
	function isaranksuri($m) {
		return sizeof(explode("rankings",$m)) > 1;
	}

	function matchuri($m) {
		return dirname($m) . "/matchresults.html";
	}
	function ranksuri($m) {
		return dirname($m) . "/rankings.html";
	}
	function cacheuri($m) {
		return "../../firstdata/cache" . strtolower(str_replace("/","_",$m) ) ;
	}
	function getcache($m) {
		return @file_get_contents( cacheuri($m) );
	}
	function readtime($m) {
		$k = explode("$",$m,2);
		return $k[0];
	}

	//Load cache.
	$fromcache = getcache($req);
	if (!$fromcache) {
		//There is no cached file.
		//$remote = @file_get_contents("http://www2.usfirst.org/" . $req); //Get the file from USFIRST
		include("condense.php");
		if ($remote) {
			file_put_contents(cacheuri($req),(time() + 1) . "]$ [There was no cache]" . $remote); //Cache the file
			exit("[There was no cache]" . $remote); //Tell the client the contents of the file
		} else {
			exit("404");
		}
	}

	echo "[Current time: " . time() . "]";

	//The file is cached.
	if ( readtime($fromcache) > time() ) {
		//The cache time hasn't expired.
		exit("[Cached]" . $fromcache);
	}

	function matchesdone($m) { //Pass it the contents of the MatchResults page. Returns true if that comp. is done.
		$k = explode("Number",$m,3);
		if (sizeof($k) < 3) {
			return false;
		}
		$r = strrpos($k[2],"20",0);
		if ($r < 3 && $r >= 0) {
			echo "These matches are done.";
			return true;
		}
	}

	// The file is cached but expired.
	//$remote = @file_get_contents("http://www2.usfirst.org/" . $req);
	include("condense.php");
	if ($remote) {
		$ti = time() + 5 * 60;
		if (isamatchuri($req)) {
			echo "(This is a match results page.)";
			//The request is for a match page.
			if (matchesdone($remote)) {
				$ti = time() + 365*24*60*60; //Cache for 1 year, not 5 minutes; the competition is over.
			}
		}
		if (isaranksuri($req)) {
			echo "(this is a rankings page)";
			$cachedmatch = getcache(matchuri($req));
			if ($cachedmatch && matchesdone($cachedmatch)) {
				$ti = time() + 365*24*60*60; //Cache for 1 year
			}
		}
		file_put_contents(cacheuri($req), $ti . "]$" . "UNCACHED RESULT [Expires: " .   $ti . "]" . $remote); //Cache the file
		exit($remote); //Tell the client the contents of the file
	} else {
		if ($fromcache) {
			exit("old" . $fromcache);
		} else {
			exit("404");
		}
	}
	exit("500");
}

?>

<!doctype html>

<html> 
	<head>
		<meta charset="UTF-8">
		<title>Adambots Automated Scouting Kit</title>
		<!--[if IE]><script type="text/javascript" src="<?php directory();?>excanvas/excanvas.js"></script><![endif]-->
		<script type="text/javascript" src="<?php directory();?>prediction.js"></script>
		<script type="text/javascript" src="<?php directory();?>output.js"></script>
		<script type="text/javascript" src="<?php directory();?>statistics.js"></script>
		<script type="text/javascript" src="<?php directory();?>graphing.js"></script>
		<script type="text/javascript" src="<?php directory();?>hashtable.js"></script>
		<script type="text/javascript" src="<?php directory();?>matrix.js"></script>
		<script type="text/javascript" src="<?php directory();?>frcevent.js"></script>
		<script type="text/javascript" src="<?php directory();?>sorttable.js"></script>
		<script type="text/javascript" src="<?php directory();?>page.js"></script>
		<script type="text/javascript" src="<?php directory();?>main.js"></script>
		<link href="<?php directory();?>scouting.css" rel="stylesheet" type="text/css">
	</head>
	<body style="width:820px; padding-left:50px; padding-right:50px; margin-left:auto; margin-right:auto;">
		<h1>Adambots Automated Scouting Kit</h1>
		<p>The Adambots Automated Scouting Kit (AASK) automatically generates estimations of the ability of robots at competition. 
		It utilizes the estimation of solutions to linear equations to predict expected contributions.
		<p>This tool was produced using Javascript, PHP, HTML, and CSS by Adambots team members for any <em>FIRST</em> robotics teams to use! 
		Click the table headings to sort the table.  See <a href="#about">About This Tool&#x25BE;</a> below for information about this tool and instructions for use.<br/>
		<br/><b>Important note:</b> this tool will only produce constructive and accurate results when enough matches have been played; each team should have played at least several matches before any of these calculations are taken seriously.<br/>
		
		<div id="change-selection" style="text-align:center;">
			<h3>Competition Select</h3>
			<div style="height:35px;">
				<select id="compselector" style="width:484px;height:35px;outline:none;vertical-align:top;"></select>
				<span style="display:inline-block; width:6px;height:1px; background:white;"></span>
				<button id="goToComp" style="width:60px;height:35px;">Go!</button>
				<span style="display:inline-block; width:6px;height:1px; background:white;"></span>
				<button onclick="goToSchedule()" style="width:120px;height:35px;">Schedule</button>
				<span style="display:inline-block; width:6px;height:1px; background:white;"></span>
				<button onclick="goToRankings()" style="width:120px;height:35px;">Rankings</button>
				<br/>
			</div>
			<script src="<?php directory();?>competitions.js" type="text/javascript"></script>
		</div>
		
		<br/>
		
		<div style="width:819px; margin:0px; padding:0px;position:relative;overflow:hidden;">
			<table class="shinytable" id="bigtable" data-sorting="iidddddd" style="width:819px;">
				<thead>
					<tr>
						<td colspan="9">
						<script>document.write(eventName + " (Analysis)");</script>
						</td>
					</tr>
					<tr>
						<td colspan="2">FIRST Data*</td>
						<td colspan="4">Direct Calculations<sup>&dagger;</sup></td>
						<td colspan="3">Subjective Calculations<sup>&Dagger;</sup></td>
					</tr>
					<tr>
						<td>Team</td>
						<td>Rank</td>
						<td>Auton</td>
						<td>Climb</td>
						<td>Teleop</td>
						<td>OPR</td>
						<td>DPR</td>
						<td>CCWM</td>
						<td>Seed<sup>&#167;</sup></td>
					</tr>
				</thead>
				<tbody id="bigdata">
					<tr><td colspan="9"><em>Waiting for script to load...</em></td></tr>
				</tbody>
				<tfoot>
					<tr><td colspan="9">
						* Tabulated directly from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
						&dagger; Calculated using match and ranking data directly to solve a system of linear equations.  These numbers are reliable <em>estimates</em> of team utility.<br/>
						&Dagger; Calculated from raw data and previous calculations manipulated in a way deemed meaningful by the creators of AASK.<br/>
						&#167; Projected Seed, from match results predicted with OPR.
					</td></tr>
				</tfoot>
			</table>
		</div>
		
		<!-- End of Big Table -->
		
		<br/>
		<div class="hr"></div>
		<br/>
		
		<div style="width:819px; margin:0px; padding:0px;"> <!--Column container-->
		
			<!-- Column 1 -->
			
			<div style="width:400px; margin:0px; padding:0px; float:left;">
				<!-- Correlation Table -->
				<table class="shinytable" id="correlationtable" data-sorting="iidddddddd" style="width:400px;">
					<thead>
						<tr>
							<td colspan="10">
							<script>document.write(eventName + " (Correlation)");</script>
							</td>
						</tr>
						<tr>
							<td></td>
							<td>Team</td>
							<td>Rank</td>
							<td>Auton</td>
							<td>Climb</td>
							<td>Teleop</td>
							<td>OPR</td>
							<td>DPR</td>
							<td>CCWM</td>
							<td>Seed*</td>
						</tr>
					</thead>
					<tbody id="correlationdata">
						<tr><td colspan="10"><em>Waiting for script to load...</em></td></tr>
					</tbody>
					<tfoot>
						<tr><td class="description" colspan="10">
							*Projected Seed
							<br/>
							This is a correlation matrix for many of the various statistics we have collected and calculated, including raw point values.  Values near positive or negative one indicate a high correlation.
						</td></tr>
					</tfoot>
				</table>
			
				<br/>
				<div class="hr"></div>
				<br/>
				
				<!-- Score Distribution Graph -->
				<table class="shinytable">
					<thead><tr><td>Point Distributions</td></tr></thead>
						<tbody>
							<tr><td>
								<canvas id="graphDistro" width="398" height="240" style="background:white;width:398x; height:240px; border:0px #AAAAAA solid;">Graphs require the HTML 5 canvas object.</canvas>
							</td></tr>
						</tbody>
					<tfoot><tr><td>
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#EE9999;"></span></span>
					OPR True Distribution Approximation<br/>
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#9999EE;"></span></span>
					CCWM True Distribution Approximation<br/>						
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#CC5555;"></span></span>
					OPR Normal Distribution<br/>			
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#5555CC;"></span></span>
					CCWM Normal Distribution<br/>	
					  </td></tr></tfoot>
				</table>
				
				<br/>
				<div class="hr"></div>
				<br/>
				
				<!-- Match Scores Graph -->
				<table class="shinytable"><thead><tr><td>Match Scores</td></tr><tbody><tr><td>
					<canvas id="graphMatches" width="398" height="240" style="background:white;width:398x; height:240px; border:0px #AAAAAA solid;">Graphs require the HTML 5 canvas object.</canvas>
					
					<tfoot><tr><td>
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#EE9999;"></span></span>
					Winning Match Score<br/>
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#9999EE;"></span></span>
					Losing Match Score<br/>						
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#CC5555;"></span></span>
					Moving Average of Winning Score (10 matches)<br/>			
					<span style="display:inline-block; position:relative; width:30px;">&nbsp;<span style="display:block; position:absolute; top:40%; height:21%; width:100%; background:#5555CC;"></span></span>
					Moving Average of Losing Score (10 matches)<br/>	
					 </td></tr></tfoot>
				</table>
			</div>
			
			<!-- Between Columns -->
			
			<!-- Column 2 -->
			<div style="width:400px; margin:0px; padding:0px; float:right;">
				
				<!-- Match Prediction Box -->
				<table class="shinytable" style="width:400px;">
					<thead>
						<tr>
							<td colspan="2">
								Custom Match Prediction
							</td>
						</tr>
						<tr>
							<td>Red</td><td>Blue</td>
						</tr>
					</thead>
					<tbody><tr>
						<td>
							<div style="height:7px;"></div>
							<input class="mini" id="predictionred1" /><span style="width:12px;display:inline-block;"> + </span><input class="mini" id="predictionred2" /><span style="width:12px;display:inline-block;"> + </span><input class="mini" id="predictionred3" /><br/>
							<div style="height:7px;"></div>
							<input id="redallianceprediction" tabindex="500" class="mini" style="width:178px; background:#FFE0E0;" readonly />
							<div style="height:7px;"></div>
						</td>
						<td>
							<div style="height:7px;"></div>
							<input class="mini" id="predictionblue1" /><span style="width:12px;display:inline-block;"> + </span><input class="mini" id="predictionblue2" /><span style="width:12px;display:inline-block;"> + </span><input class="mini" id="predictionblue3" /><br/>
							<div style="height:7px;"></div>
							<input id="blueallianceprediction" tabindex="500" class="mini" style="width:178px; background:#E0E0FF;" readonly /> 
							<div style="height:7px;"></div>
						</td>
						</tr>
						<tr>
							<td id="predictedresult" colspan="2">Tie</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td colspan="2">
								<label><input name="m1atchpredictionmode" type="radio" checked="checked" id="m1atchpredictionmode0" />Estimate Scores using OPR</label><br/>
								<label><input name="m1atchpredictionmode" type="radio" id="m1atchpredictionmode1" />Estimate Scores using OPR+DPR</label><br/>
								<label><input name="m1atchpredictionmode" type="radio" id="m1atchpredictionmode2" />Estimate Winning Margin using CCWM</label><br/>
							</td>
						</tr>
					</tfoot>
				</table>
				
			<br/>
			<div class="hr"></div>
			<br/>

			<!-- Unplayed Match Prediction -->
			<table class="shinytable" id="matchpredictions">
				<thead>
					<tr><td colspan="5">Predictions for Unplayed Matches</td></tr>
					<tr><td style="width:20px;">Match</td><td>Red Alliance</td><td>Blue Alliance</td><td>Red Prediction</td><td>Blue Prediction</td></tr>
				</thead>
				<tbody>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="5">
							<label><input name="m2atchpredictionmode" type="radio" checked="checked" id="m2atchpredictionmode0" />Estimate Scores using only OPR (<span id="m2ode0acc"><em>loading...</em></span>)</label><br/>
							<label><input name="m2atchpredictionmode" type="radio" id="m2atchpredictionmode1" />Estimate Scores using OPR+DPR (<span id="m2ode1acc"><em>loading...</em></span>)</label><br/>
							<label><input name="m2atchpredictionmode" type="radio" id="m2atchpredictionmode2" />Estimate Winning Margin using CCWM (<span id="m2ode2acc"><em>loading...</em></span>)</label><br/>
						</td>
					</tR>
				</tfoot>
			</table>


			</div>

		</div>
		
		<div style="clear:both; padding-top:30px;"><!--return to 1 column layout-->
			<h2 id="about">About This Tool</h2>
			
			<h3>What Do All Those Numbers Mean?</h3>
			<p>Below is a description of each of the columns of the <a href="#bigtable">Analysis Table&#x25B4;</a> above.  Remember that you can sort the columns of the table by clicking the underlined headings!
			<ul>
				<li><b>Rank:</b> The team's rank at the event, in terms of Qualification Points, as reported by <em>FIRST</em>.</li>
				<li><b>Auton:</b> An estimate of the number of points a team scores, on average, during the autonomous period.</li>
				<li><b>Climb:</b> An estimate of the number of points a team earns, on average, by climbing.</li>
				<li><b>Teleop:</b> An estimate of the number of points a team scores, on average, during the teleoperated period.  Please note that any foul points are included in each team's Teleop score by FIRST.  Unfortunately, this is how FIRST handles score reporting, and our system cannot circument this custom.</li>
				<li><b>OPR:</b> Offensive Power Rating.  An estimate of the number of points the team scores overall, on average.  This number represents the offensive utility of a team.  Comparable to the OPR reported by other teams.  Please note that this value is slightly skewed by foul points (see above).</li>
				<li><b>DPR:</b> Defensive Power Rating.  An estimate of the defensive utility of a team.  May be interpreted as the number of points that a team takes away from its opposing alliance, on average.</li>
				<li><b>CCWM:</b> Calculated Contribution to Winning Margin.  An estimate of the number of points a team contributes to the winning margin of its alliance.</li>
				<li><b>Seed:</b> Projected final tournament seed (ranking), calculated from OPR-predicted match results.
			</ul>
			
			<h3>Should My Team Still Scout?</h3>
			<p>Yes!  AASK is meant only as a secondary source of information, either as a basis for comparison or to replace missing or faulty information.  We do not guarantee that the results of our estimates will accurately reflect the capabilities of each team.
		
			<h3>How Does This Work?</h3>
			<p>For each point category, our system solves a <a href="http://en.wikipedia.org/wiki/System_of_linear_equations">system of linear equations</a> for the "average contribution" of each team per match.  Each equation corresponds to a single team and expresses the total accumulated points earned by that team as a linear combination of that team's average contribution and the average contributions of every other team that has competed on an alliance with that team.  Naturally, we represent the system of equations with a single matrix equation of the form <code>Ax=b</code>
			<ul>
				<li>Vector <code>b</code> contains the aggregate point value (one of AP, CP, TP, or their sum) for each team.</li>
				<li>Each element <code>A<sub>ij</sub></code> of matrix <code>A</code> represents the number of times team <code>i</code> has played with team <code>j</code>.
					Each element on the diagonal, therefore, is the total number of matches played by the team represented by that row and column.  As a result, our
					matrix has the following properties:
					<ul>
						<li>It is <a href="http://en.wikipedia.org/wiki/Symmetric_matrix">symmetric</a>.</li>
						<li>It is irreducibly <a href="http://en.wikipedia.org/wiki/Diagonally_dominant_matrix">diagonally dominant</a>.</li>
					</ul>
				</li>
				<li>We solve for the vector <code>x</code>, which contains the average contribution of each team.</li>
			</ul>
		
			<p>Because of the special properties of our matrix, we can easily find an exact solution when the matrix is nonsingular using <a href="http://en.wikipedia.org/wiki/LU_decomposition">LU Factorization</a> (without pivoting!) followed by forward- and back-substitution.  When the matrix is singular, we approximate the solution iteratively with the <a href="http://en.wikipedia.org/wiki/Gauss-Seidel">Gauss-Seidel method</a> and display a warning to the user.
		
			<p>The <b>Defensive Power Rating (DPR)</b> for a team is calculated by iterating through the list of completed matches and using the calculated OPR values to predict the outcome of each match.  For each match, for both alliances, the difference between this expected outcome and the true outcome of the match is credited to the defensive utility of the opposing alliance.  For each team, we sum up these differences and solve a linear system similar to the one above using this new tabulated data.
			
			<p>The <b>Calculated Contribution to the Winning Margin (CCWM)</b> for each team is calculated by summing up the alliance score difference for each team for each match and solving our favorite system of linear equations for the <code>x</code> vector with these margins in our <code>b</code> vector.
			
			<p>The <b>Projected Seed (Seed)</b> for each team is calculated by predicting the results of unplayed matches with OPR, and adjusting their win/loss/tie record accordingly.
			
			<p>AASK is dependent on the match schedule and rankings reported by <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a>.  Occasionally, the <em>FIRST</em> website will experience an outage, rendering our tool temporarily incapacitated.  We have implemented a simple caching system, designed to reduce the frequency of such failures, but ultimately the status of the <em>FIRST</em> website controls the functionality of this tool.<br/>

			<h3>Want Source Code?</h3>
			This project is available on <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">GitHub</a> under the <a href="http://www.gnu.org/licenses/gpl.html">GPU General Public License</a>:
			<br/><br/>
			
			<div class="license">
				<code>The <em>Adambots Automated Scouting Kit (AASK)</em> is free software: you can 
				redistribute it and/or modify it under the terms of the GNU General Public License
				as published by the Free Software Foundation, either version 3 of the License, 
				or (at your option) any later version.
				<br/><br/>
				AASK is distributed in the hope that it will be useful, but WITHOUT ANY
				WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
				PARTICULAR PURPOSE.  See the GNU General Public License for more details.
				<br/><br/>
				You should have received a copy of the GNU General Public License along with
				AASK.  If not, see <a href="http://www.gnu.org/licenses/">http://www.gnu.org/licenses/</a>.
				<br/><br/>
				AASK was started during the 2013 FIRST season by Ben Bray and Curtis Fenner of
				Team 245, the Adambots, for use by other FRC teams.</code>
				<br/>
			</div>
			
			<h3>Excanvas.js</h3>
			This project utilizes <code>Excanvas.js</code> (&copy; Google 2006) for backwards compatibility with 
			Microsoft Internet Explorer, which is licenced under the Apache License. See <a href="excanvas">here</a>.
		</div>
		<div style="height:50px;"></div>
		<script type="text/javascript">setTimeout(Main,1);</script>
	</body>
</html>
