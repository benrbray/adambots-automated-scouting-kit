(The relevant PHP / HTML code to make this run)
<?php
if (isset($_REQUEST["grab"]))
{
exit(file_get_contents("http://www2.usfirst.org/" . $_REQUEST["grab"]));
}
?>

<!doctype html>
<html>
<head>
<title>Adambots Automated Scouting Kit</title>
<script type="text/javascript" src="main.js"></script>
<link href="style.css" rel="stylesheet" type="text/css">


</head>
<body>


<div style="border:1px solid #EEEEEE; width:474px; padding:1px;">
<table cellspacing="0" id="thetable">
<thead>
<tr>
<td colspan="6">
[Competition Name]
</td>
</tr>
<tr>
<td style="width:30px;">Team*</td>
<td style="width:30px;">Ranking*</td>
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
<tr><td colspan="6" style="width:460px;">
*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.</td></tr>
</tfoot>
</table>
</div>

<script type="text/javascript">Main();</script>
