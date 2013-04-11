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

function vectorToArray(v) {
	if (isMatrix(v)) {
		if (v.getRows() == 1) {
			return v.data[0];
		}
		//Let's return the first element of every row.
		var k = [];
		for (var i = 0; i < v.getRows(); i++) {
			k[i] = v.get(i,0);
		}
		return k;
	}
	return v; //is an array already?
}

function maximumOfVector(v) {
	var r = v[0];
	for (var i = 0; i < v.length; i++) {
		r = Math.max(r,v[i]);
	}
	if (isNaN(r)) {
		return 1;
	}
	return r;
}

function minimumOfVector(v) {
	var r = v[0];
	for (var i = 0; i < v.length; i++) {
		r = Math.min(r,v[i]);
	}
	if (isNaN(r) ) {
		return -1;
	}
	return r;
}


/**
Fills a table's first tbody with data ( id=[id] ).
Columns is a list of matricies/vectors/arrays (I have to make it figure it out somehow)

Sty is an array representing how to style each column:
grey/gray: #EEEEEE
redgreen: 

fix is an array of the number of decimals to have per column. Defautls to two.


**/
function fillTable( id , columns , sty , fix , sortable, globalColorExtremes, firstColumnIsHeader) {
	// Convert Columns to Arrays
	for (var i = 0; i < columns.length; i++) {
		columns[i] = vectorToArray(columns[i]);
	}
	var tb = document.getElementById(id).tBodies[0];
	
	// Find Global Extremes
	var globalLow = minimumOfVector(columns[0]);
	var globalHigh = maximumOfVector(columns[0]);
	for(var i = 1; i < columns.length; i++){
		var min = minimumOfVector(columns[i]);
		var max = maximumOfVector(columns[i]);
		if(min < globalLow){
			globalLow = min;
		}
		if(max > globalHigh){
			globalHigh = max;
		}
	}
	
	// Create Table
	var s = "";
	for (var row = 0; row < columns[0].length; row++) {
		s = s + "<tr>";
		for (var i = 0; i < columns.length; i++) {
			//redgreen default

			var low = globalColorExtremes?globalLow:minimumOfVector(columns[i]);
			var high = globalColorExtremes?globalHigh:maximumOfVector(columns[i]);

			var a = [227,137,147]; // Red
			var b = [247,247,137]; // Yellow
			var c = [152,227,167]; // Green
			
			if (sty[i] == "white") {
				a = b = c = [255,255,255];
			} else if (sty[i] == "red") {
				a = b = c = [255, 200, 200];
			} else if (sty[i] == "blue") {
				a = b = c = [200, 200, 255];
			} else if (sty[i] == "grey" || sty[i] == "gray") {
				a = b = c = [238,238,238];
			} else if (sty[i] == "greenred") {
				var e = c;
				c = a;
				a = e;
			} else if (sty[i] == "mirrorwhitegreen"){
				a = c;
				b = [255, 255, 255];
			} else if (sty[i] == "mirrorwhitered"){
				c = a;
				b = [255, 255, 255];
			}

			s = s + "<td style=\"background:" + getGradient(low,columns[i][row],high,a,b,c) + ((i==0&&firstColumnIsHeader)?"; font-weight:bold":"") + "\">";
			if (fix[i] != undefined) {
				if (fix[i] < 0) {
					s = s + columns[i][row];
				} else {
					s = s + ((columns[i][row].toFixed)?columns[i][row].toFixed(fix[i]):columns[i][row]);
				}
			} else {
				s = s + ((columns[i][row].toFixed)?columns[i][row].toFixed(fix[i]):columns[i][row]);
			}
			s = s + "</td>";
		}
		s = s + "</tr>";
	}
	tb.innerHTML = s;
	if (sortable) {
		setupTable(document.getElementById(id));
	}
}

function colorLerp(c1,c2,v) {
  return [c1[0]*(1-v) + c2[0]*v , c1[1]*(1-v) + c2[1]*v , c1[2]*(1-v) + c2[2]*v ];
}

function colorToHex(c) {
  var u = "0123456789ABCDEF";
  function m(x)
  {
    return Math.floor(x);
  }
  return "#" + u.charAt(m(c[0]/16)) + u.charAt(m(c[0])%16) + u.charAt(m(c[1]/16)) + u.charAt(m(c[1])%16) + u.charAt(m(c[2]/16)) + u.charAt(m(c[2])%16);
}

/**
Return a color from the three color gradient
**/
function getGradient(lo,val,hi,A,B,C) {
	if (isNaN(val/2*2)) {
		return colorToHex(A);
	}
  	var md = (lo + hi)/2;
	var hf = (hi - lo)/2;
	if (val < md) {
		var x = (val - lo) / hf;
		return colorToHex(colorLerp(A,B,x));
	}
	var x = (val - md) / hf;
	return colorToHex(colorLerp(B,C,x));	
}