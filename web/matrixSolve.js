const NL_ENTITY = "&#13;&#10;";

//// ENTRY METHODS ------------------------------------------------------------

function luClick(){
	var matrix = getMatrix("coefficients");

	document.getElementById("matrixValue").innerHTML = 
		"Your matrix was interpreted as:<br><code>" + 
		matrixToFormattedString(matrix) + 
		"</code>";
}

function solveClick(){
	var coefficients = getMatrix("coefficients");
	var constants = getVector("constants");

	document.getElementById("matrixValue").innerHTML = 
		"Your matrix was interpreted as:<br><code>" + 
		matrixToFormattedString(coefficients) + 
		"</code>";

	solveLU(coefficients, constants);
}

function getMatrix(textAreaID){
	// Get Text Value and Trim
	var matText = new String(document.getElementById(textAreaID).value).killWhiteSpace();

	// Prepare Variables
	var matrix = new Array();
	var start = 0;
	var nextIndex = 0;
	var rows = 0;

	// Parse Row by Row
	while(nextIndex > -1){
		nextIndex = matText.indexOf(";", start);
		var row = new String(matText.substring(start, (nextIndex==-1?matText.length:nextIndex)));
		matrix[rows] = row.split(",");
		for(var i = 0; i < matrix[rows].length; i++){
			matrix[rows][i] = parseFloat(matrix[rows][i]);
		}
		rows++;
		start = nextIndex+1;
	}

	return matrix;
}

function getVector(textAreaID){
	// Get Text Value and Trim
	var vecText = new String(document.getElementById(textAreaID).value).killWhiteSpace();

	// Prepare Variables
	var vec = vecText.split(new RegExp("[^\\d\\.\\-\\+]+"));
	var start = 0;
	var nextIndex = 0;
	var rows = 0;

	console.log("vec:  " + vec.toString());

	for(var i = 0; i < vec.length; i++){
		vec[i] = parseFloat(vec[i]);
	}

	return vec;
}