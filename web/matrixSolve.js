const NL_ENTITY = "&#13;&#10;";

function luClick(){
	// Retrieve Matrix from Text Area
	var matText = new String(document.getElementById("matrix").value).killWhiteSpace();
	var matrix = new Array();
	var start = 0;
	var nextIndex = 0;
	var rows = 0;
	
	while(nextIndex > -1){
		nextIndex = matText.indexOf(";", start);
		var row = new String(matText.substring(start, (nextIndex==-1?matText.length:nextIndex)));
		matrix[rows] = row.split(",");
		for(var i = 0; i < matrix[rows].length; i++){
			matrix[rows][i] = parseInt(matrix[rows][i]);	
		}
		rows++;
		start = nextIndex+1;
	}
	
	document.getElementById("matrixValue").innerHTML = "Your matrix was interpreted as:<br>" + matrixToFormattedString(matrix);
	
	luFactorize(matrix);
}

function luFactorize(matrix){
	var lu = new Array(matrix.length);
	
	document.getElementById("luFactorization").innerHTML = "The LU Factoriztion of your matrix is:<br>" + matrixToFormattedString(lu);
}

function matrixToFormattedString(matrix){
	var s = "[";
	
	for(var i = 0; i < matrix.length; i++){
		var submat = matrix[i];
		if(submat instanceof Array){
			s += submat.toString();
			if(i<matrix.length-1) { s += "<br>"; };
		} else {
			s += submat + ",";
		}
	}
	
	s += "]";
	return s;
}

String.prototype.killWhiteSpace = function() {
    return this.replace(/\s/g, '');
};