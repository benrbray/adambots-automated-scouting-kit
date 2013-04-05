<?php
/*
Licensed use:
The Adambots Automated Scouting Kit (AASK) is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation, version 3 of the License. 
AASK is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. 
You should have received a copy of the GNU General Public License along with AASK.
If not, see <http://www.gnu.org/licenses/>.

*/


//(The relevant PHP / HTML code to make this run)
/*
This is the only server-side work done.
Loading a page from WW2.USFIRST.ORG violates the same-origin policy.
Instead, this pages acts a proxy, so same-origin isn't violated.
*/
if (isset($_REQUEST["grab"])) {
    $u = @file_get_contents("http://www2.usfirst.org/" . $_REQUEST["grab"]);
	if ($u) {
		exit($u);
	} else {
		exit("404");
	}
}

?>

<!doctype html>

<html> 
	<head>
		<meta charset="UTF-8">
		<title>Adambots Automated Scouting Kit</title>
		<!--[if IE]><script type="text/javascript" src="excanvas/excanvas.js"></script><![endif]-->
		<script type="text/javascript" src="prediction.js"></script>
		<script type="text/javascript" src="output.js"></script>
		<script type="text/javascript" src="graphing.js"></script>
		<script type="text/javascript" src="hashtable.js"></script>
		<script type="text/javascript" src="matrix.js"></script>
		<script type="text/javascript" src="frcEvent.js"></script>
		<script type="text/javascript" src="sorttable.js"></script>
		<script type="text/javascript" src="page.js"></script>
		<script type="text/javascript" src="main.js"></script>
		<link href="scouting.css" rel="stylesheet" type="text/css">
	</head>
	<body style="width:820px; padding-left:50px; padding-right:50px; margin-left:auto; margin-right:auto;">
		<h1>Adambots Automated Scouting Kit</h1>
		The Adambots Automated Scouting Kit (AASK) automatically generates estimations of the ability of robots at competition. It utilizes the estimation of solutions to linear equations to predict expected contributions.<br/><br/>
		This system is produced in Javascript by Adambots team members for any <em>FIRST</em> robotics teams to use!
		<br/>
		<br/>
		Click the table headings to sort the table.<br/>
		<br/>
		
		<div id="change-selection" style="text-align:center;">
			Select Competition:<br/><br/>
			<div style="height:35px;">
				<select id="compselector" style="width:754px;height:35px;outline:none;vertical-align:top;"></select><span style="display:inline-block; width:6px;height:1px; background:white;"></span><button id="goToComp" style="width:60px;height:35px;">Go!</button><br/>
			</div>
			<script src="competitions.js" type="text/javascript"></script>
		</div>
		
		<br/>
		
		<div style="width:819px; margin:0px; padding:0px;">
			<table class="shinytable" id="bigtable" data-sorting="iidddddd" style="width:819px;">
				<thead>
					<tr>
						<td colspan="8">
						<script>document.write(eventName + " (Analysis)");</script>
						</td>
					</tr>
					<tr>
						<td colspan="2">FIRST Data</td>
						<td colspan="4">Direct Calculations</td>
						<td colspan="2">Subjective Calculations</td>
					</tr>
					<tr>
						<td>Team*</td>
						<td>Rank*</td>
						<td>Auton**</td>
						<td>Climb**</td>
						<td>Teleop**</td>
						<td>OPR**</td>
						<td>DPR**</td>
						<td>CCWM**</td>
					</tr>
				</thead>
				<tbody id="bigdata">
					<tr><td colspan="8"><em>Waiting for script to load...</em></td></tr>
				</tbody>
				<tfoot>
					<tr><td colspan="8">
					*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
					**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.</td></tr>
				</tfoot>
			</table>
		</div>
		
		<br/>
		<div class="hr"></div>
		<br/>
		
		<div style="width:819px; margin:0px; padding:0px;"> <!--Column container-->
		
			<!-- Column 1 -->
			
			<div style="width:400px; margin:0px; padding:0px; float:left;">
				<!-- Match Scores Graph -->
				<table class="shinytable"><thead><tr><td>Match Scores</td></tr><tbody><tr><td>
					<canvas id="graphMatches" width="398" height="240" style="background:white;width:398x; height:240px; border:0px #AAAAAA solid;">Graphs require the HTML 5 canvas object.</canvas>
				</table>
				
				<br/>
				<div class="hr"></div>
				<br/>
			</div>
			
			<!-- Between Columns -->
			
			<!-- Column 2 -->
			
			<div style="width:400px; margin:0px; padding:0px; float:right;">
				
				<!-- Match Prediction Table -->
				<table class="shinytable" style="width:400px;">
					<thead>
						<tr>
							<td colspan="2">
								Match Prediction
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
						<tr>
							<td colspan="2">
								<label><input name="m1atchpredictionmode" type="radio" checked="checked" id="m1atchpredictionmode0" />OPR Only</label><br/>
								<label><input name="m1atchpredictionmode" type="radio" id="m1atchpredictionmode1" />OPR + DPR</label><br/>
								<label><input name="m1atchpredictionmode" type="radio" id="m1atchpredictionmode2" />CCWM</label><br/>
							</td>
						</tr>
					</tbody>
				</table>
				
			<br/>
			<div class="hr"></div>
			<br/>

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
							<label><input name="m2atchpredictionmode" type="radio" checked="checked" id="m2atchpredictionmode0" />OPR Only (<span id="m2ode0acc"></span>)</label><br/>
							<label><input name="m2atchpredictionmode" type="radio" id="m2atchpredictionmode1" />OPR + DPR (<span id="m2ode1acc"></span>)</label><br/>
							<label><input name="m2atchpredictionmode" type="radio" id="m2atchpredictionmode2" />CCWM (<span id="m2ode2acc"></span>)</label><br/>
						</td>
					</tR>
				</tfoot>
			</table>


			</div>

		</div>
		
		<div style="clear:both; padding-top:30px;"><!--return to 1 column layout-->
			<h2>How Does This Work?</h2>
			<p>For each point category, our system solves a system of linear equations for the "average contribution" of each team per match.  Each equation corresponds to a single team and expresses the total accumulated points earned by that team as a linear combination of that team's average contribution and the average contributions of every other team that has competed on an alliance with that team.  Naturally, we represent the system of equations with a single matrix equation of the form <code>Ax=b</code>
			<ul>
				<li>Vector <code>b</code> contains the aggregate point value for each team.</li>
				<li>Each element <code>A<sub>i&#8291;j</sub></code> of matrix <code>A</code> represents the number of times team <code>i</code> has played with team <code>j</code>.
					Each element on the diagonal, therefore, is the total number of matches played by the team represented by that row and column.  As a result, our
					matrix has the following properties:
					<ul>
						<li>It is symmetric.</li>
						<li>It is (very loosely speaking) diagonally dominant.</li>
						<li>It is always nonsingular.</li>
					</ul>
				</li>
				<li>We solve for the vector <code>x</code>, which contains the average contribution of each team.</li>
			</ul>
		
			<p>Because of the special properties of our matrix, we can easily find an exact solution using LU Factorization (without pivoting!) followed by forward- and back-substitution.</p>
		
			<p>This Javascript implementation is dependent on the match and rankings reported by <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a>.<br/>
			Example pages for the 2013 Grand Blanc competition:
			<ul>
				<li><a href="http://www2.usfirst.org/2013comp/Events/MIGBL/rankings.html">http://www2.usfirst.org/2013comp/Events/MIGBL/rankings.html</a></li>
				<li><a href="http://www2.usfirst.org/2013comp/events/MIGBL/matchresults.html">http://www2.usfirst.org/2013comp/events/MIGBL/matchresults.html</a></li>
			</ul>

			<h2>Want Source Code?</h2>
			This project is available on <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">GitHub</a>. It is available in <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">web</a> form, utilizing PHP, Javascript, HTML, and CSS.<br/>
			<br/>
			Licensed use:<br/>
			The <em>Adambots Automated Scouting Kit (AASK)</em> is free software: you can redistribute it and/or modify
			it under the terms of the GNU General Public License as published by
			the Free Software Foundation, either version 3 of the License.
			<br/>
			AASK is distributed in the hope that it will be useful,
			but WITHOUT ANY WARRANTY; without even the implied warranty of
			MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
			GNU General Public License for more details.
			<br/>
			You should have received a copy of the GNU General Public License
			along with AASK.  If not, see &lt;http://www.gnu.org/licenses/&gt;.
			<br/>
			<br/>
			This project utilizes Excanvas.js (&copy; Google 2006) for backwards compatibility for Microsoft Internet Explorer which is licenced under the Apache License.<br/>
			See <a href="excanvas">here</a>.
		</div>
		<script type="text/javascript">setTimeout(Main,1);</script>
	</body>
</html>
