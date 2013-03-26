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
if (isset($_REQUEST["grab"]))
{
exit(file_get_contents("http://www2.usfirst.org/" . $_REQUEST["grab"]));
}
?>

<!doctype html>

<html>
	<head>
		<title>Adambots Automated Scouting Kit</title>
		<script type="text/javascript" src="sortTable.js"></script>
		<script type="text/javascript" src="table.js"></script>
		<script type="text/javascript" src="matrixSolve.js"></script>
		<script type="text/javascript" src="main.js"></script>
		<link href="style.css" rel="stylesheet" type="text/css">
	</head>
	<body>
		<h1>Adambots Automated Scouting Kit</h1>
		The Adambots Automated Scouting Kit (AASK) automatically generates estimations of the ability of robots at competition. It utilizes the estimation of solutions to linear equations to predict expected contributions.<br/>
		This system is produced in Javascript by Adambots team members for any <em>FIRST</em> robotics teams to use!
		<br/>
		<br/>
		<br/>


		<div style="border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;">
			<table id="thetable" data-sorting="iidddd">
				<thead>
					<tr>
						<td colspan="6">
							Grand Blanc Michigan District
						</td>
					</tr>
					<tr>
						<td>Team*</td>
						<td>Ranking*</td>
						<td>Autonomous Pts.**</td>
						<td>Teleoperated Pts.**</td>
						<td>Climb Pts.**</td>
						<td>Total Pts.**</td>
					</tr>
				</thead>
				<tbody id="thedata">
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
		
		<div style="height:200px;"></div>
		<br/>
		<h2>How does this work?</h2>
		This system generates a set of linear equations representing the contributions of scores of different teams. It then finds an approximate solution to the equation and displays the results.<br/>
		The Javascript implementation is dependent on the match and rankings reported by <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a>.<br/>
		Example pages for the 2013 Grand Blanc competition:
		<ul>
			<li><a href="http://www2.usfirst.org/2013comp/Events/MIGBL/rankings.html">http://www2.usfirst.org/2013comp/Events/MIGBL/rankings.html</a></li>
			<li><a href="http://www2.usfirst.org/2013comp/events/MIGBL/matchresults.html">http://www2.usfirst.org/2013comp/events/MIGBL/matchresults.html</a></li>
		</ul>

		<h2>Want source code?</h2>
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

		<script type="text/javascript">Main();</script>
	</body>
</html>
