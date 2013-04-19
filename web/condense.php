<?php

function outoftag($str) {
	//e.g
	//<a>b<c><d>efg</k></m><n>o</p>
	//returns
	//befgo
	 $intag = false; //whether or not position [i] is in an html tag (between < and >)
	 $quoted = false; //whether or not position [i] is in an attribute in a tag between < X "i" >
	 $text = ""; //The text collected to return. Spaces between tags? Nope. Silly. Of course not.
	for ( $i = 0; $i < strlen($str); $i++) {
		$ch = substr($str,$i,1);
		if (!$intag) {
			//outside of a tag
			if ($ch == "<") {
				$intag = true;
			}
			else
			{
				$text = $text . $ch;
			}
		} else {
			//INSIDE of a tag.
			if (!$quoted) {
				//Not already IN a quote.
				if ($ch == "\""){
					$quoted = true;
				}
				if ($ch == ">") {
					$intag = false;
				}
			}else{
			//Inside of a quote, waiting for a ".
				if ($ch == "\"") {
					$quoted = false;
				}
			}
		}
	}
	return $text;
}



$remote = "";

//$req = $_REQUEST["u"];
$body = file_get_contents("http://www2.usfirst.org/" . $req);
$body = strtoupper($body);
$rows = explode("<TR",$body);
$table = array();
array_shift($rows);
for ($i = 0; $i < count($rows); $i++) {
	//Trim out just the insides of table rows.
	$k = explode("</TR",$rows[$i],2);
	$rows[$i] = $k[0];
	$k = explode(">",$rows[$i],2);
	$rows[$i] = " " . trim($k[1]) . " ";
	//Now get the insides of columns
	$table[$i] = explode("<TD",$rows[$i]);
	array_shift($table[$i]);
	for ($j = 0; $j < count($table[$i]); $j++) {
		$table[$i][$j] = outoftag("<TD" . $table[$i][$j]);
		$input = $table[$i][$j];
		$output = trim(preg_replace('/\s+/', ' ', $input));
		$output = str_replace(";",",",$output);
		$remote = $remote .  trim($output) . ";";
	}
	$remote = $remote . "\n";
}


?>