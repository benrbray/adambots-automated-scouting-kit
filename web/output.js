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
	return r;
}

function minimumOfVector(v) {
	var r = v[0];
	for (var i = 0; i < v.length; i++) {
		r = Math.min(r,v[i]);
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
function fillTable( id , columns , sty , fix , sortable) {
	for (var i = 0; i < columns.length; i++) {
		columns[i] = vectorToArray(columns[i]);
	}
	var tb = document.getElementById(id).tBodies[0];
	
	var s = "";
	for (var row = 0; row < columns[0].length; row++) {
		s = s + "<tr>";
		for (var i = 0; i < columns.length; i++) {
			//redgreen default

			var low = minimumOfVector(columns[i]);
			var high = maximumOfVector(columns[i]);

			var a = [227,137,147];
			var b = [247,247,137];
			var c = [152,227,167];

			if (sty[i] == "grey" || sty[i] == "gray") {
				a = b = c = [238,238,238];
			}
			if (sty[i] == "greenred") {
				var e = c;
				c = a;
				a = e;
			}

			s = s + "<td style=\"background:" + getGradient(low,columns[i][row],high,a,b,c) + "\">";
			if (fix[i] != undefined) {
				s = s + columns[i][row].toFixed(fix[i]);
			} else {
				s = s + columns[i][row].toFixed(2);
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
  	var md = (lo + hi)/2;
	var hf = (hi - lo)/2;
	if (val < md) {
		var x = (val - lo) / hf;
		return colorToHex(colorLerp(A,B,x));
	}
	var x = (val - md) / hf;
	return colorToHex(colorLerp(B,C,x));	
}