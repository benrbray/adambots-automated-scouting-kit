var NL_ENTITY = "&#13;&#10;";

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
		coefficients.toHTMLString() + 
		"</code>";

	var result = coefficients.gaussSeidel(constants);
	
	document.getElementById("solution").innerHTML = 
		"Solution:<br><code>" + 
		result.toHTMLString() + 
		"</code>";
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

	return new Matrix(matrix);
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

	return arrayToColumnVector(vec);
}

//// MATRIX ARITHMETIC --------------------------------------------------------

function subtractMat(x, y){
	var xRows = x.length;
	var xCols = x[0].length;
	var yRows = y.length;
	var yCols = y[0].length;
	
	if(xRows != yRows || xCols != yCols){
		throw "Cannot subtract matrices of nonconformant dimensions! [" + xRows + ", " + xCols + "]-[" + yRows + ", " + yCols + "]";
	}
	
	var result = new Array(xRows);
	for(var i = 0; i < xRows; i++){
		result[i] = new Array(xCols);
		for(var j = 0; j < xCols; j++){
			result[i][j] = x[i][j] - y[i][j];
		}
	}
	
	return result;
}

function subtractVec(x, y){
	var xRows = x.length;
	var yRows = y.length;
	
	if(xRows != yRows){
		throw "Cannot subtract matrices of nonconformant dimensions! [" + xRows + ", " + xCols + "]-[" + yRows + ", " + yCols + "]";
	}
	
	var result = new Array(xRows);
	for(var i = 0; i < xRows; i++){
		result[i] = x[i] - y[i];
	}
	
	return result;
}

function multiplyMatMat(x, y){
	var xRows = x.length;
	var xCols = x[0].length;
	
	var yRows = y.length;
	var yCols = y[0].length;
	
	if(xCols != yRows){
		throw "Cannot multiply matrices of nonconformant dimensions! [" + xRows + ", " + xCols + "]x[" + yRows + ", " + yCols + "]";
	}
	
	var result = new Array(xRows);
	
	for(var i = 0; i < xRows; i++){
		result[i] = new Array(yCols);
		for(var j = 0; j < yCols; j++){
			var sum = 0;
			
			for(var k = 0; k < xCols; k++){
				sum += x[i][k] * y[k][j];
			}
			result[i][j] = sum;
		}
	}
	
	
	return result;
}

function multiplyMatVec(X, y){
	if(!X || !y) throw "Cannot multiply undefined matrix/vector!";
	var xRows = X.length;
	var xCols = X[0].length;
	
	var yRows = y.length;
	var yCols = 1;
	
	if(xCols != yRows){
		throw "Cannot multiply matrices of nonconformant dimensions! [" + xRows + ", " + xCols + "]x[" + yRows + ", " + yCols + "]";
	}
	
	var result = new Array(xRows);
	
	for(var i = 0; i < xRows; i++){
		result[i] = new Array(yCols);
		var sum = 0;
			
		for(var k = 0; k < xCols; k++){
			sum += X[i][k] * y[k];
		}
		
		result[i] = sum;
	}
	
	
	return result;
}

function matrixDiagProduct(A){
	if(!A) { return NaN; };
	var product = A[0][0];
	for(var i = 1; i < A.length; i++){
		product *= A[i][i];
	}
	return product;
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
			for(var p = 0; p < j; p++){
				alpha -= matrix[i][p] * matrix[p][j];
			}
			matrix[i][j] = alpha / matrix[j][j];
		}
		
		for(var j = i; j < n; j++){
			var alpha = matrix[i][j];
			for(var p = 0; p < i; p++){
				alpha -= matrix[i][p] * matrix[p][j];
			}
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
function luFactorizeTogether(matrix, LU){
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

	LU = lu;
	return lu;
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
	
	// Return Iterative Approximation if Singular
	var detL = matrixDiagProduct(L);
	var detU = matrixDiagProduct(U);
	
	if(isNaN(detL) || isNaN(detU) || detL === 0 || detU === 0){
		alert("Warning:  It appears that not enough matches have been played.  The displayed solution is a \"best guess\", use additional discretion when interpreting results.");
		return gaussSeidel(A, b);
	} else {
		var y = forwardSolve(L, b);
		var x = backSolve(U, y);
		return x;
	}
}

function backSolve(A, b){
	var n = A.length;
	var x = new Array(n);
	for(var i = n-1; i >= 0; i--){
		var sum = 0;
		for(var j = i+1; j < n; j++){
			sum += A[i][j] * x[j];
		}
		x[i] = (b[i] - sum) / A[i][i];
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

/**
 * Gauss-Seidel Iterative Method (SLOW & SUBOPTIMAL)
 * Guaranteed to converge if either
 *  - A is symmetric positive-definite, or
 *  - A is strictly or irreducibly diagonally dominant.
 * In our case, the latter is true.
 */
function gaussSeidel(A, b){
	// Initialize
	var n = b.length;
	var phi = randVector(n);
	
	// Gauss-Seidel
	var error = 100;
	var iterations = 0;
	while(error > 0.001 && iterations < 1000){
		iterations++;
		
		// Iterate
		for(var i = 0; i < n; i++){
			var omega = 0;
			for(var j = 0; j < n; j++){
				if(j != i){
					omega += A[i][j] * phi[j];
				}
			}
			phi[i] = (1/A[i][i]) * (b[i] - omega);
		}
	
		// Check Error
		var estimate = multiplyMatVec(A, phi);
		var residual = subtractMat(estimate, b);
		error = Math.abs(residual[0]);
		for(var i = 1; i < residual.length; i++){
			if(Math.abs(residual[i]) > error){
				error = Math.abs(residual[i]);
			}
		}
	}
	
	return phi;
}

//// MATRIX HELPER METHODS ----------------------------------------------------

function createMatrix(rows, columns){
	var m = new Array(rows);
	for(var i = 0; i < columns; i++){
		m[i] = new Array(columns);
	}
	return m;
}

function randVector(size){
	var m = new Array(size);
	for(var i = 0; i < size; i++){
		m[i] = Math.random();
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
			if(i<matrix.length-1) { s += "<br>"; };
		} else {
			s += submat + (i<matrix.length-1?",":"");
		}
	}
	
	s += "]";
	return s;
}

String.prototype.killWhiteSpace = function() {
    return this.replace(/\s/g, '');
};