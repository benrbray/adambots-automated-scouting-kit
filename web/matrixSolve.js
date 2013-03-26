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

//// LU FACTORIZATION ---------------------------------------------------------

/**
 * Performs LU factorization on 'matrix' using the Doolittle algorithm and 
 * overwrites its entries with a matrix that contains the unit lower-triangular
 * matrix L in the subdiagonal and the upper-triangular matrix U in remaining 
 * entries.
 * @param matrix The matrix to factorize.  The values in this matrix will be 
 * overwritten with the LU factorization in condensed form.
 */
function luFactorizeInPlace(matrix){
	var n = matrix.length;
	
	for(var i = 0; i < n; i++){
		for(var j = 0; j < i; j++){
			var alpha = matrix[i][j];
			console.log("A:  " + alpha);
			for(var p = 0; p < j; p++){
				alpha -= matrix[i][p] * matrix[p][j];		
				console.log("\tA:  " + alpha);
			}
			console.log("\tFINAL= " + alpha);
			matrix[i][j] = alpha / matrix[j][j];
		}
		
		for(var j = i; j < n; j++){
			var alpha = matrix[i][j];
			console.log("B:  " + alpha);
			for(var p = 0; p < i; p++){
				alpha -= matrix[i][p] * matrix[p][j];	
				console.log("\tB:  " + alpha);
			}
			console.log("\tFINAL= " + alpha);
			matrix[i][j] = alpha;
		}
	}
}

/**
 * Performs LU factorization on 'matrix' using the Doolittle algorithm and 
 * overwrites 'LU' with a matrix that contains the unit lower-triangular matrix
 * L in the subdiagonal and the upper-triangular matrix U in remaining entries.
 * @param matrix The matrix to factorize.
 * @param LU The resulting LU factorization in condensed form.
 */
function luFactorizeTogether(matrix){
	var n = matrix.length;
	
	// Initialize LU Matrix
	var lu = new Array(n);
	for(var i = 0; i < n; i++){
		lu[i] = new Array(n);
	}
	
	// Doolittle Algorithm
	for(var i = 0; i < n; i++){
		// Compute U
		for(var j = 0; j < i; j++){
			var alpha = matrix[i][j];
			for(var p = 0; p < j; p++){
				alpha -= lu[i][p] * lu[p][j];
			}
			lu[i][j] = alpha / lu[j][j];
		}
		
		// Compute L
		for(var j = i; j < n; j++){
			var alpha = matrix[i][j];
			for(var p = 0; p < i; p++){
				alpha -= lu[i][p] * lu[p][j];	
			}
			lu[i][j] = alpha;
		}
	}
}

/**
 * Performs LU factorization on 'matrix' using the Doolittle algorithm and
 * overwrites 'L' and unit lower-triangular and upper-triangular matrices,
 * respectively.
 * @param matrix The matrix to factorize.
 * @param L The resulting unit lower-triangular matrix will be written to this
 * array.
 * @param U The resulting upper-triangular matrix will be written to this
 * array.
 */
function luFactorizeSeparate(matrix, L, U){
	var n = matrix.length;
	
	// Initialize Matrices
	L.constructor(n); // Retain Array Reference by Reinstantiating
	U.constructor(n); // Retain Array Reference by Reinstantiating
	for(var i = 0; i < n; i++){
		L[i] = new Array(n);
		U[i] = new Array(n);
		for(var j = 0; j < n; j++){
			U[i][j] = 0;
			L[i][j] = (i==j?1:0);
		}
	}
	
	// Doolittle Algorithm
	for(var i = 0; i < n; i++){
		// Compute L:  Unit Lower-Triangular Product of Elementary Matrices
		for(var j = 0; j < i; j++){
			var alpha = matrix[i][j];
			for(var p = 0; p < j; p++){
				alpha -= L[i][p] * U[p][j];
			}
			L[i][j] = alpha / U[j][j];
		}
		
		// Compute U:  Upper-Triangular REF
		for(var j = i; j < n; j++){
			var alpha = matrix[i][j];
			for(var p = 0; p < i; p++){
				alpha -= L[i][p] * U[p][j];	
			}
			U[i][j] = alpha;
		}
	}
}

//// LINEAR SYSTEM SOLVING ----------------------------------------------------

/**
 * Solves the system of linear equations Ax=b using LU Factorization.  The 
 * solution vector, x, is returned.
 * 
 *    Ax = b	(System)
 * (LU)x = b	(LU Factorize)
 * L(Ux) = b	(Regroup)
 * L   y = b	(Solve for y using Forward Substitution)
 *    Ux = y	(Solve for x using Back Substitution)
 * 
 * @param A The coefficient matrix.
 * @param b A vector of constants representing the right-hand side of the
 * equation.
 */
function solveLU(A, b){
	// Initialize
	var n = A.length;
	var x = new Array(n);
	
	// LU Decomposition
	var L = new Array();
	var U = new Array();
	
	luFactorizeSeparate(A, L, U);
	var y = forwardSolve(L, b);
	var x = backSolve(U, y);
	
	var stringL = matrixToFormattedString(L);
	var stringU = matrixToFormattedString(U);
	var stringSolution = matrixToFormattedString(x);
	
	document.getElementById("luFactors").innerHTML = "L=<br><code>" + stringL + "</code><br>U=<br><code>" + stringU + "</code>";
	
	document.getElementById("solution").innerHTML = "x=<br><code>" + stringSolution + "</code>"
}

function backSolve(A, b){
	var n = A.length;
	var x = new Array(n);
	for(var i = n-1; i >= 0; i--){
		console.log("i:  " + i);
		var sum = 0;
		for(var j = i+1; j < n; j++){
			console.log("\tj:  " + j);
			console.log("\tA[" + i + "][" + j + "]:  " + A[i][j]);
			console.log("\t\tx[" + j + "]:  " + x[j]);
			sum += A[i][j] * x[j];
		}
		x[i] = (b[i] - sum) / A[i][i];
		console.log("\tb[i]:  " + b[i]);
		console.log("\tsum:  " + sum);
		console.log("\tA[i][i]:  " + A[i][i]);
		console.log("\tx[" + i + "]:  " + x[i]);
	}
	
	return x;
}

function forwardSolve(A, b){
	var n = A.length;
	var x = new Array(n);
	for(var i = 0; i < n; i++){
		var sum = 0;
		for(var j = 0; j < i; j++){
			sum += A[i][j] * x[j];
		}
		x[i] = (b[i] - sum) / A[i][i];
	}
	
	return x;
}

//// MATRIX HELPER METHODS ----------------------------------------------------

function createMatrix(rows, columns){
	var m = new Array(rows);
	for(var i = 0; i < columns; i++){
		m[i] = new Array(columns);
	}
	return m;
}

function eye(size){
	var m = new Array(size);
	for(var i = 0; i < size; i++){
		m[i] = new Array(size);
		for(var j = 0; j < size; j++){
			m[i][j] = (i==j?1:0);
		}
	}
	return m;
}

//// STRING FORMATTING --------------------------------------------------------

function matrixToFormattedString(matrix){
	var s = "[";
	
	for(var i = 0; i < matrix.length; i++){
		var submat = matrix[i];
		if(submat instanceof Array){
			s += submat.toString();
			if(i<matrix.length-1) { s += "\n"; };
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