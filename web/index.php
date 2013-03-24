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
<script type="text/javascript" src="table.js"></script>
<script type="text/javascript" src="main.js"></script>
<link href="style.css" rel="stylesheet" type="text/css">


</head>
<body>


<div style="border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;">
<table cellspacing="0" id="thetable">
<thead>
<tr>
<td colspan="6">
[Competition Name]
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
<tr><td colspan="6"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>
</tbody>
<tfoot>
<tr><td colspan="6">
*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.</td></tr>
</tfoot>
</table>
</div>

<script type="text/javascript">Main();</script>
