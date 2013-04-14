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

/**
 * MATRIX.JS
 * The Matrix object is essentially a 2D Array with special helper methods to
 * assist with matrix arithmetic and linear system solving.
 */
 
//// MATRIX OBJECT CONSTRUCTOR -----------------------------------------------
 
function Matrix(data){
	// Initialize
	this.type = "Matrix";
	this.data = data;
	
	// Fields
	
	// Methods
	this.getData	= function(){			return this.data;					};
	this.getRows 	= function(){			return this.data.length; 			};
	this.getCols 	= function(){			return this.data[0].length; 		};
	this.getColumns = function(){			return this.data[0].length; 		};
	this.add		= function(mat){		return MatrixAdd(this, mat);		};
	this.subtract	= function(mat){		return MatrixSubtract(this, mat);	};
	this.multiply	= function(mat){		return MatrixMultiply(this, mat);	};
	this.get		= function(i, j){		return this.data[i][j];				};
	this.set		= function(i, j, k){	this.data[i][j] = k;				};
	this.toString	= function(){			return MatrixToString(this);		};
	this.toHTMLString=function(){			return MatrixToHTMLString(this);	};
	this.isSquare	= function(){			return MatrixIsSquare(this);		};
	this.luSeparate	= function(){			return MatrixLUSeparate(this);		};
	this.forwardSolve=function(b){			return MatrixForwardSolve(this, b);	};
	this.backSolve	= function(b){			return MatrixBackSolve(this, b);	};
	this.solveLU	= function(b){			return MatrixSolveLU(this, b);		};
	this.gaussSeidel= function(b){			return MatrixGaussSeidel(this, b);	};
	this.transpose	= function(){			return MatrixTranspose(this);		};
	this.diagProduct= function(){			return MatrixDiagProduct(this);		};
	this.scale		= function(c){			return MatrixScale(this, c);		};
	this.plus 		= function(i,j,k){		this.data[i][j] = this.data[i][j]+k;};
	this.increment 	= function(i, j){		this.plus(i,j,1);					};
	this.rowHash	= function(i,j){		return MatrixConstructRowHash(this,i,j); };
	this.columnHash	= 
		this.colHash= function(i,j){		return MatrixConstructColumnHash(this,i,j); };
	this.submat		= function(i,j,k,l){	return MatrixSubMatrix(this,i,j,k,l);};
	this.toSingleArray=function(){			return MatrixToSingleArray(this);	};
}

/**
 * Returns a boolean indicating whether or not the given object is a Matrix.
 */
function isMatrix(obj){
	return (obj.type == "Matrix");
}

/**
 * Attempts to cast the given object as a Matrix if it is not one already.  If
 * the conversion is not possible, an error is thrown.
 */
function MatrixTypeCoerce(mat){
	if(!isMatrix(mat)){
		// Try to Cast
		if(mat instanceof Array){
			if(mat[0].length){
				mat = new Matrix(mat);
			} else {
				mat = arrayToColumnVector(mat);
			}
			return;
		}
		// Not Castable, Error
		throw "Object " + mat.type + " is not of type Matrix and cannot be converted to one.";
	}
}

//// MATRIX CONSTRUCTION METHODS ----------------------------------------------

/**
 * Returns an indentity Matrix with the specified dimension.
 */
function eye(size){
	var z = new Array(size);
	for(var i = 0; i < z.length; i++){
		z[i] = new Array(size);
		for(var j = 0; j < z[i].length; j++){
			z[i][j] = (i==j?1:0);
		}
	}
	
	return new Matrix(z);
}

/**
 * Returns a matrix of zeros.
 */
function zeros(rows, columns){
	var z = new Array(rows);
	for(var i = 0; i < z.length; i++){
		z[i] = new Array(columns);
		for(var j = 0; j < z[i].length; j++){
			z[i][j] = 0;
		}
	}
	
	return new Matrix(z);
}

/**
 * Construct a Matrix of the given size with random elements, generated with
 * Math.random().
 */
function randMatrix(rows, columns){
	var z = new Array(rows);
	for(var i = 0; i < z.length; i++){
		z[i] = new Array(columns);
		for(var j = 0; j < z[i].length; j++){
			z[i][j] = Math.random();
		}
	}
	
	return new Matrix(z);
}

//// MATRIX CONVERSION METHODS ------------------------------------------------

/**
 * Dumps the elements of a single-dimensional array of length N into a Matrix
 * object of size [Nx1].
 */
function arrayToColumnVector(arr){
	var result = zeros(arr.length, 1);
	
	for(var i = 0; i < result.getRows(); i++){
		result.set(i, 0, arr[i]);
	}
	
	return result;
}

/**
 * Dumps the elements of a single-dimensional array of length N into a Matrix
 * object of size [1xN].
 */
function arrayToRowVector(arr){
	var result = zeros(1, arr.length);
	
	for(var i = 0; i < result.getCols(); i++){
		result.set(0, i, arr[i]);
	}
	
	return result;
}

/**
 * Construct a Hashtable relating two rows of the given Matrix.
 * @keyRowIndex The index of the row that contains entries to be used as keys
 * in the new Hashtable.
 * @valueRowIndex The index of the row that contains entries to be used as
 * values in the new Hashtable.
 */
function MatrixConstructRowHash(mat, keyRowIndex, valueRowIndex) {
	// Type Check
	MatrixTypeCoerce(mat);
	
	// Make Hash
	var hash = Hashtable();
	
	for (var i = 0; i < mat.getCols(); i++) {
		hash.put(mat.get(keyRowIndex,i), mat.get(valueRowIndex, i));
	}
	
	return hash;
}

/**
 * Construct a Hashtable relating two columns of the given Matrix.
 * @keyColumnIndex The index of the column that contains entries to be used as
 * keys in the new Hashtable.
 * @valueColumnIndex The index of the column that contains entries to be used
 * as values in the new Hashtable.
 */
function MatrixConstructColumnHash(mat, keyColumnIndex, valueColumnIndex) {
	// Type Check
	MatrixTypeCoerce(mat);
	
	// Make Hash
	var hash = Hashtable();
	
	for (var i = 0; i < mat.getRows(); i++) {
		hash.put(mat.get(i, keyColumnIndex), mat.get(i, valueColumnIndex));
	}
	
	return hash;
}

/**
 * Extract a submatrix from the specified Matrix.  All indecies are inclusive,
 * and all indecies start at zero.  (This means that the last row/column has
 * an index of length-1)
 */
function MatrixSubMatrix(mat, startRowIndexInclusive, endRowIndexInclusive, startColIndexInclusive, endColIndexInclusive){
	MatrixTypeCoerce(mat);
	
	var rows = endRowIndexInclusive - startRowIndexInclusive + 1;
	var cols = endColIndexInclusive - startColIndexInclusive + 1;
	var sub = zeros(rows, cols);
	
	for(var i = 0; i < rows; i++){
		for(var j = 0; j < cols; j++){
			sub.set(i, j, mat.get(startRowIndexInclusive + i, startColIndexInclusive + j));
		}
	}
	
	return sub;
}

function MatrixToSingleArray(mat){
	MatrixTypeCoerce(mat);
	
	var arr = new Array(mat.getRows() * mat.getCols());
	var n = 0;
	for(var i = 0; i < mat.getRows(); i++){
		for(var j = 0; j < mat.getCols(); j++){
			arr[n] = mat.get(i, j);
			n++;
		}
	}
	
	return arr;
}

//// MATRIX ARITHMETIC --------------------------------------------------------

/**
 * Performs Matrix addition on a Matrix A of size [MxN] and a Matrix B of size
 * [MxN] and returns the result, C, of size [MxN].
 * 
 * C := A + B
 */
function MatrixAdd(A, B){
	// Check Type & Dimensions
	MatrixTypeCoerce(A);
	MatrixTypeCoerce(B);
	if(A.getRows() != B.getRows() || A.getCols() != B.getCols()){
		throw "Cannot Add Matrices of Dimension [" + A.getRows() + ", " + A.getCols() + "] and [" + B.getRows() + ", " + B.getCols() + "]";
	}
	
	// Add
	var C = zeros(A.getRows(), A.getCols());
	for(var i = 0; i < C.getRows(); i++){
		for(var j = 0; j < C.getCols(); j++){
			C.set(i, j, A.get(i,j) + B.get(i,j));
		}
	}
	
	return C;
}

/**
 * Performs Matrix subtraction on a Matrix A of size [MxN] and a Matrix B of
 * size [MxN] and returns the result, C, of size [MxN].
 * 
 * C := A - B
 */
function MatrixSubtract(A, B){
	// Check Type & Dimensions
	MatrixTypeCoerce(A);
	MatrixTypeCoerce(B);
	if(A.getRows() != B.getRows() || A.getCols() != B.getCols()){
		throw "Cannot Subtract Matrices of Dimension [" + A.getRows() + ", " + A.getCols() + "] and [" + B.getRows() + ", " + B.getCols() + "]";
	}
	
	// Subtract
	var C = zeros(A.getRows(), A.getCols());
	for(var i = 0; i < C.getRows(); i++){
		for(var j = 0; j < C.getCols(); j++){
			C.set(i, j, A.get(i,j) - B.get(i,j));
		}
	}
	
	return C;
}

/**
 * Performs Matrix multiplication on a Matrix A of size [MxN] and a Matrix B of
 * size [NxP] and returns the result, C, of size [MxP].
 * 
 * C := A * B
 */
function MatrixMultiply(A, B){
	// Check Type & Dimensions
	MatrixTypeCoerce(A);
	MatrixTypeCoerce(B);
	if(A.getCols() != B.getRows()){
		throw "Cannot Multiply Matrices of Dimension [" + A.getRows() + ", " + A.getCols() + "] and [" + B.getRows() + ", " + B.getCols() + "]";
	}
	
	// Multiply
	var C = zeros(A.getRows(), B.getCols());
	for(var i = 0; i < C.getRows(); i++){
		for(var j = 0; j < C.getCols(); j++){
			var sum = 0;
			
			for(var k = 0; k < A.getCols(); k++){
				sum += A.get(i, k) * B.get(k, j);
			}
			
			C.set(i, j, sum);
		}
	}
	
	return C;
}

/**
 * Performs scalar Multiplication on each element of Matrix A.
 *
 * C := c * A
 */
function MatrixScale(A, c){
	MatrixTypeCoerce(A);
	
	// Scale
	var C = zeros(A.getRows(), A.getCols());
	for(var i = 0; i < C.getRows(); i++){
		for(var j = 0; j < C.getCols(); j++){
			C.set(i, j, c * A.get(i,j));
		}
	}
	
	return C;
}

//// MATRIX MISC. METHODS -----------------------------------------------------

/**
 * Checks to see if the Matrix is square.
 */
function MatrixIsSquare(A){
	return (A.getRows() == A.getCols());
}

/**
 * Returns the product of the diagonal entris of the Matrix.
 */
function MatrixDiagProduct(A){
	MatrixTypeCoerce(A);
	
	if(!A.isSquare()){
		throw "Matrix is not diagonal! [" + A.getRows() + ", " + A.getCols() + "]";
	}
	
	var product = A.get(0, 0);
	for(var i = 1; i < A.getRows(); i++){
		product *= A.get(i,i);
	}
	return product;
}

/**
 * Returns the transpose of the Matrix (rows and columns swapped).
 */
function MatrixTranspose(A){
	var result = zeros(A.getCols(), A.getRows());
	
	for(var i = 0; i < result.getCols(); i++){
		for(var j = 0; j < result.getRows(); j++){
			result.set(i, j, A.get(j,i));
		}
	}
	
	return result;
}

//// LU FACTORIZATION ---------------------------------------------------------

/**
 * Performs LU factorization on 'matrix' using the Doolittle algorithm and
 * returns the result.
 * @param matrix The matrix to factorize.
 * @return An array whose first element is the Matrix L and whose second
 * element is the Matrix U.
 */
function MatrixLUSeparate(matrix){
	// Validate Arguments
	MatrixTypeCoerce(matrix);
	if(!matrix.isSquare()){
		throw "Cannot LU Factorize Matrix of Dimensions [" + matrix.getRows() + ", " + matrix.getCols() + "]!";
	}
	
	var n = matrix.getRows();

	// Initialize 
	var L = eye(n);
	var U = zeros(n, n);

	// Doolittle Algorithm
	for(var i = 0; i < n; i++){
		// Compute L:  Unit Lower-Triangular Product of Elementary Matrices
		for(var j = 0; j < i; j++){
			var alpha = matrix.get(i,j);
			for(var p = 0; p < j; p++){
				alpha -= L.get(i,p) * U.get(p,j);
			}
			L.set(i, j, alpha / U.get(j,j));
		}

		// Compute U:  Upper-Triangular REF
		for(var j = i; j < n; j++){
			var alpha = matrix.get(i,j);
			for(var p = 0; p < i; p++){
				alpha -= L.get(i,p) * U.get(p,j);	
			}
			U.set(i, j, alpha);
		}
	}
	
	return [L, U];
}

//// LINEAR SYSTEM SOLVING ----------------------------------------------------

/**
 * Performs forward substitution on the given linear system and returns the result.
 */
function MatrixForwardSolve(A, b){
	var n = A.getRows();
	var x = zeros(n, 1);
	
	for(var i = 0; i < n; i++){
		var sum = 0;
		for(var j = 0; j < i; j++){
			sum += A.get(i,j) * x.get(j, 0);
		}
		x.set(i, 0, (b.get(i,0)-sum) / A.get(i,i));
	}
	
	return x;
}

/**
 * Performs back substitution on the given linear system and returns the result.
 */
function MatrixBackSolve(A, b){
	var n = A.getRows();
	var x = zeros(n, 1);
	
	for(var i = n-1; i >= 0; i--){
		var sum = 0;
		for(var j = i + 1; j < n; j++){
			sum += A.get(i,j) * x.get(j, 0);
		}
		x.set(i, 0, (b.get(i,0)-sum) / A.get(i,i));
	}
	
	return x;
}

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
 
var warningHasBeenShown = false;
 
function MatrixSolveLU(A, b, message){
	// Initialize
	var n = A.getRows();
	var x = zeros(n, 1);

	// LU Decomposition
	var LU = A.luSeparate();
	var L = LU[0];
	var U = LU[1];
	
	// Return Iterative Approximation if Singular
	var detL = L.diagProduct();
	var detU = U.diagProduct();
	
	if(isNaN(detL) || isNaN(detU) || detL === 0 || detU === 0){
		if (!warningHasBeenShown) {
			if(message) { alert(message); };
			warningHasBeenShown = true;
		}
		return A.gaussSeidel(b);
	} else {
		return MatrixSolveLUPrefactorized(L, U, b, message);
	}
}

function MatrixSolveLUPrefactorized(L, U, b, message){
	var y = L.forwardSolve(b);
	var x = U.backSolve(y);
	return x;
}

/**
 * Gauss-Seidel Iterative Method (SLOW & SUBOPTIMAL)
 * Guaranteed to converge if either
 *  - A is symmetric positive-definite, or
 *  - A is strictly or irreducibly diagonally dominant.
 * In our case, the latter is true.
 */
function MatrixGaussSeidel(A, b){
	// Initialize
	var n = A.getRows();
	var phi = randMatrix(n, 1).scale(10);
	
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
					omega += A.get(i,j) * phi.get(j,0);
				}
			}
			phi.set(i,0, (1/A.get(i,i)) * (b.get(i,0) - omega));
		}
	
		// Check Error
		var estimate = A.multiply(phi);
		var residual = estimate.subtract(b);
		error = Math.abs(residual.get(0,0));
		for(var i = 1; i < residual.getRows(); i++){
			if(Math.abs(residual.get(i,0)) > error){
				error = Math.abs(residual.get(i,0));
			}
		}
	}
	
	return phi;
}

//// MATRIX FORMATTING --------------------------------------------------------

/**
 * Returns a String representation of the Matrix, printing newlines as the
 * newline character.
 */
function MatrixToString(mat){
	MatrixTypeCoerce(mat);
	var s = "[";
	
	for(var i = 0; i < mat.getRows(); i++){
		for(var j = 0; j < mat.getCols(); j++){
			s += mat.get(i, j) + ((j<mat.getCols()-1)?",":"");
		}
		s += ((i<mat.getRows()-1)?"\n":"");;
	}
	
	s += "]";
	return s;
}

/**
 * Returns a String representation of the Matrix, printing newlines as HTML
 * <br> tags.
 */
function MatrixToHTMLString(mat){
	MatrixTypeCoerce(mat);
	var s = "[";
	
	for(var i = 0; i < mat.getRows(); i++){
		for(var j = 0; j < mat.getCols(); j++){
			s += mat.get(i, j) + ((j<mat.getCols()-1)?",":"");
		}
		s += ((i<mat.getRows()-1)?"<br>":"");;
	}
	
	s += "]";
	return s;
}