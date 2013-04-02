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
		<title>Adambots Automated Scouting Kit</title>
		<script type="text/javascript" src="frcevent.js"></script>
		<script type="text/javascript" src="sorttable.js"></script>
		<script type="text/javascript" src="colortable.js"></script>
		<script type="text/javascript" src="page.js"></script>
		<script type="text/javascript" src="main.js"></script>
		<link href="scouting.css" rel="stylesheet" type="text/css">
	</head>
	<body style="padding-left:32px; padding-right:32px; width:800px; margin-left:auto; margin-right:auto;">
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
				<select id="compselector" style="width:538px;height:35px;outline:none;vertical-align:top;"></select>
				<button id="goToComp" style="width:60px;height:35px;">Go!</button><br/>
			</div>
			
			<script>
				var competitionList = [
					["BAE Systems Granite State Regional","2013comp/Events/NHMA/"],
					["Finger Lakes Regional","2013comp/Events/NYRO/"],
					["Palmetto Regional","2013comp/Events/SCMB/"],
					["Hub City Regional","2013comp/Events/TXLU/"],
					["Central Valley Regional","2013comp/Events/CAMA/"],
					["Kettering University District","2013comp/Events/MIKET/"],
					["Traverse City District","2013comp/Events/MITVC/"],
					["Hatboro-Horsham District","2013comp/Events/PAHAT/"],
					["Greater Toronto East Regional","2013comp/Events/ONTO/"],
					["San Diego Regional","2013comp/Events/CASD/"],
					["Orlando Regional","2013comp/Events/FLOR/"],
					["WPI Regional","2013comp/Events/MAWO/"],
					["Lake Superior Regional","2013comp/Events/MNDU/"],
					["Northern Lights Regional","2013comp/Events/MNDU2/"],
					["New York City Regional","2013comp/Events/NYNY/"],
					["Autodesk Oregon Regional","2013comp/Events/ORPO/"],
					["Lone Star Regional","2013comp/Events/TXHO/"],
					["Gull Lake District","2013comp/Events/MIGUL/"],
					["Waterford District","2013comp/Events/MIWFD/"],
					["Israel Regional","2013comp/Events/ISTA/"],
					["Montreal Regional","2013comp/Events/QCMO/"],
					["Peachtree Regional","2013comp/Events/GADU/"],
					["Boilermaker Regional","2013comp/Events/INWL/"],
					["Greater Kansas City Regional","2013comp/Events/MOKC/"],
					["St. Louis Regional","2013comp/Events/MOSL/"],
					["North Carolina Regional","2013comp/Events/NCRE/"],
					["Pittsburgh Regional","2013comp/Events/PAPI/"],
					["Virginia Regional","2013comp/Events/VARI/"],
					["Detroit District","2013comp/Events/MIDET/"],
					["St. Joseph District","2013comp/Events/MISJO/"],
					["TCNJ District","2013comp/Events/NJEWN/"],
					["Springside - Chestnut Hill District","2013comp/Events/PAPHI/"],
					["Waterloo Regional","2013comp/Events/ONWA/"],
					["Phoenix Regional","2013comp/Events/AZCH/"],
					["Sacramento Regional","2013comp/Events/CASA/"],
					["Los Angeles Regional sponsored by The Roddenberry Foundation","2013comp/Events/CALB/"],
					["Bayou Regional","2013comp/Events/LAKE/"],
					["Boston Regional","2013comp/Events/MABO/"],
					["Queen City Regional","2013comp/Events/OHIC/"],
					["Dallas Regional","2013comp/Events/TXDA/"],
					["Utah Regional co-sponsored by the Larry H. Miller Group & Platt","2013comp/Events/UTWV/"],
					["Central Washington Regional","2013comp/Events/WASE2/"],
					["Wisconsin Regional","2013comp/Events/WIMI/"],
					["West Michigan District","2013comp/Events/MIWMI/"],
					["Grand Blanc District","2013comp/Events/MIGBL/"],
					["Mount Olive District","2013comp/Events/NJFLA/"],
					["Lenape Seneca District","2013comp/Events/NJLEN/"],
					["Greater Toronto West Regional","2013comp/Events/ONTO2/"],
					["Inland Empire Regional","2013comp/Events/CASB/"],
					["Connecticut Regional sponsored by UTC","2013comp/Events/CTHA/"],
					["Washington DC Regional","2013comp/Events/DCWA/"],
					["South Florida Regional","2013comp/Events/FLBR/"],
					["Minnesota 10000 Lakes Regional","2013comp/Events/MNMI/"],
					["Minnesota North Star Regional","2013comp/Events/MNMI2/"],
					["Buckeye Regional","2013comp/Events/OHCL/"],
					["Oklahoma Regional","2013comp/Events/OKOK/"],
					["Smoky Mountains Regional","2013comp/Events/TNKN/"],
					["Alamo Regional sponsored by Rackspace Hosting","2013comp/Events/TXSA/"],
					["Seattle Regional","2013comp/Events/WASE/"],
					["Livonia District","2013comp/Events/MILIV/"],
					["Troy District","2013comp/Events/MITRY/"],
					["Western Canadian Regional","2013comp/Events/ABCA/"],
					["Razorback Regional","2013comp/Events/ARFA/"],
					["Silicon Valley Regional","2013comp/Events/CASJ/"],
					["Colorado Regional","2013comp/Events/CODE/"],
					["Hawaii Regional sponsored by BAE Systems","2013comp/Events/HIHO/"],
					["Midwest Regional","2013comp/Events/ILCH/"],
					["Crossroads Regional","2013comp/Events/INTH/"],
					["Pine Tree Regional","2013comp/Events/MELE/"],
					["Las Vegas Regional","2013comp/Events/NVLV/"],
					["SBPLI Long Island Regional","2013comp/Events/NYLI/"],
					["Spokane Regional","2013comp/Events/WACH/"],
					["Bedford District","2013comp/Events/MIBED/"],
					["Bridgewater-Raritan District","2013comp/Events/NJBRG/"],
					["Chesapeake Regional","2013comp/Events/MDBA/"],
					["Michigan State Championship","2013comp/Events/MICMP/"],
					["Mid-Atlantic Robotics Regional Championship","2013comp/Events/MRCMP/"],
					["Archimedes Championship","2013comp/Events/Archimedes/"],
					["Curie Championship","2013comp/Events/Curie/"],
					["Galileo Championship","2013comp/Events/Galileo/"],
					["Newton Championship","2013comp/Events/Newton/"]
				];
				
				var compselector = document.getElementById("compselector");
				var goToComp = document.getElementById("goToComp");
				var s = "";
				
				for (var i = 0; i < competitionList.length; i++) {
					s += "<option id='event" + competitionList[i][0].split(" ").join("").split("-").join("") +"'>" + competitionList[i][0] + "</option>";
				}
				
				compselector.innerHTML = s;
				var url = document.URL;
				url = url.split("?");
				url[1] = !url[1] ? [] : url[1].split("&");
				
				for (var i = 0; i < url[1].length; i++) {
					url[1][i] = url[1][i].split("=");
				}
				
				url = {"url" : url[0], "params" : url[1], "param" : {}};
				
				for (var i = 0; i < url.params.length; i++) {
					url.param[url.params[i][0]] = url.params[i][1];
				}
				
				if (url.param.comp) {
					document.getElementById("event" + url.param.comp.split(" ").join("").split("-").join("")).selected = "selected";
				}
				
				goToComp.onclick = function() {
					window.location = url.url + "?comp=" + (compselector.options[compselector.selectedIndex].innerHTML).split(" ").join("-");
				}

				var eventName = competitionList[i][0];
				var eventURL = competitionList[i][1];
				//var rankingsPage = competitionList[i][1];
				//var resultsPage = competitionList[i][2];
				
				for (var i = 0; i < competitionList.length; i++) {
					if ((url.param.comp||"").split("-").join("") == competitionList[i][0].split(" ").join("").split("-").join("")){
						eventName = competitionList[i][0];
						eventURL = competitionList[i][1];
						//rankingsPage = competitionList[i][1];
						//resultsPage = competitionList[i][2];
					}
				}
				</script>
			</div>

		<br/>
		
		<div style="border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;">
			<table class="shinytable" id="oprtable" data-sorting="iidddd">
				<thead>
					<tr>
						<td colspan="6">
						<script>document.write(eventName + " Estimated Contributions");</script>
						</td>
					</tr>
					<tr>
						<td>Team*</td>
						<td>Ranking*</td>
						<td>Autonomous Pts.**</td>
						<td>Climb Pts.**</td>
						<td>Teleoperated Pts.**</td>
						<td>Total Pts.**</td>
					</tr>
				</thead>
				<tbody id="oprdata">
					<tr><td colspan="6"><em>Waiting for script to load...</em></td></tr>
				</tbody>
				<tfoot>
					<tr><td colspan="6">
					*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
					**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.</td></tr>
				</tfoot>
			</table>
		</div>

		<br/>
		<!--
		<div style="border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;">
			<table class="shinytable" id="matchtable">
				<thead>
					<tr>
						<td colspan="11">
							<script>document.write(eventName + " Match Predictions")</script>
						</td>
					</tr>
					<tr>
						<td>Match</td>
						<td>Red 1</td>
						<td>Red 2</td>
						<td>Red 3</td>
						<td>Blue 1</td>
						<td>Blue 2</td>
						<td>Blue 3</td>
						<td>Red Score**</td>
						<td>Blue Score**</td>
						<td>Est. Blue Score**</td>
						<td>Est. Blue Score**</td>
					</tr>
				</thead>
				<tbody id="matchdata">
					<tr><td colspan="1"><em>Waiting for script to load...</em></td></tr>
				</tbody>
				<tfoot>
					<tr><td colspan="11">
					*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
					**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.
					</td></tr>
				</tfoot>
			</table>
		</div>
		-->
		
		<br/>
		<div style="height:70px;"></div>
		<br/>
		
<h2>How Does This Work?</h2>
		<p>For each point category, our system solves a system of linear equations for the "average contribution" of each team per match.  Each equation corresponds to
		a single team and expresses the total accumulated points earned by that team as a linear combination of that team's average contribution and the average 
		contributions of every other team that has competed on an alliance with that team.  Naturally, we represent the system of equations with a single matrix equation
		of the form <code>Ax=b</code>
		
		<ul>
			<li>Vector <code>b</code> contains the aggregate point value for each team.</li>
			<li>Each element <code>A(i,j)</code> of matrix <code>A</code> represents the number of times team <code>i</code> has played with team <code>j</code>.
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
		This project is available on <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">GitHub</a>. It is available in <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">web</a> and <a href="https://github.com/benrbray/adambots-automated-scouting-kit/tree/master/java">Java</a> forms.<br/>
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

		<script type="text/javascript">setTimeout(Main,1);</script>
	</body>
</html>
