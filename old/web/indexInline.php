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
if (isset($_REQUEST["grab"])) {
    $u = @file_get_contents("http://www2.usfirst.org/" . $_REQUEST["grab"]);
	if ($u) {
		exit($u);
	} else {
		exit("404");
	}
}

?>

<!doctype html>

<html>
	<head>
		<title>Adambots Automated Scouting Kit</title>
		<script type="text/javascript">/**
 * HASHTABLE.JS
 * Hashtable object that mimicks the functionality of a Java Hashtable.
 * Note:  This is simply a JavaScript array with some added methods.
 */

//// CONSTRUCTOR --------------------------------------------------------------

function Hashtable(){
	var hash = {type:"Hashtable", count:0};
	
	hash.get = function(key) { return hash[key]; };
	
	hash.put = function(key, value) {
		hash[key] = value;
		hash.count++;
	};
	
	hash.remove = function(key){
		hash[key] = undefined;
		hash.count--;
	}
	
	hash.size = function() { return hash.count; };
	
	return hash;
}

function HashtableTypeCheck(hash){
	if(!hash.type || !hash.type == "Table"){
		throw "Hashtable :: Illegal Argument : hash (" + hash.type + ") is not of type 'Hashtable'";
	}
}</script>
		<script type="text/javascript" src="<?php bloginfo('template_directory');?>/js/scouting/sorttable.js"></script>
		<script type="text/javascript">//// TABLE.JAVA EQUIVALENT ----------------------------------------------------

/**
 * TABLE.JS
 * Designed as the equivalent of Table.java.  Create a new Table object with
 * the Table() method ("constructor").
 * The URL is either RANKINGS or MATCHES, depending on the desired data.  It 
 * is NOT the actual URL; this name is kept for consistency's sake.
 */
 
//// TABLE CONSTRUCTOR --------------------------------------------------------

/**
 * Mimick the Java version's Table() class.
 * @param baseURL The URL for the HTML page from which to extract the table.
 * @param whichTable Specifies the type of Table being extracted.  This
 * determines how the HTML page will be parsed, as it is different for
 * each table.
 */
function Table(tableURL) {
	//console.log("[Table] started (tableURL=" + tableURL + ")");
	var tbl = {type:"Table"};
	
	// Table Fields
	tbl.url = tableURL;
	tbl.requestComplete = false;
	
	// Table Method Wrappers
	tbl.loadTable = function(onrequestcomplete) {
		TableLoadTable(tbl, onrequestcomplete);
	}
	
	tbl.getTable = function() {
		return TableGetTable(tbl);
	};
	tbl.getHeadings = function() {
		return TableGetHeadings(tbl);
	};
	tbl.getBody = function(noNaNs) {
		return TableGetBody(tbl, noNaNs);
	};
	tbl.constructColumnHash = function(keyColumnIndex, valueColumnIndex) {
		return TableConstructColumnHash(tbl, keyColumnIndex, valueColumnIndex);
	};
	tbl.constructRowHash = function(keyRowIndex,valueRowIndex) {
		return TableConstructRowHash(tbl, keyRowIndex, valueRowIndex);
	};
	tbl.getRows = function() {
		return TableGetRows(tbl);
	};
	tbl.getColumns = function() {
		return TableGetColumns(tbl)
	};
	
	// Return Table
	return tbl;
}

//// STATUS CHECKS & EXCEPTIONS -----------------------------------------------

/**
 * Checks that the given object is a Table.
 */
function TableTypeCheck(tbl){
	// Type Check
	if(!tbl.type || !tbl.type == "Table"){
		throw "Table :: Illegal Argument : tbl (" + tbl.type + ") is not of type 'Table'";
	}
}

/**
 * Checks that the given Table object has completed its request.
 */
function TableLoadedCheck(tbl){
	if(!tbl.requestComplete || !tbl.tableText){
		throw "Table :: Data Not Yet Loaded : (tbl.requestComplete=" + tbl.requestComplete + ", tbl.tableText=" + tbl.tableText + ")";
	}
}

//// TABLE METHODS ------------------------------------------------------------

/**
 * Begins loading FRC match data into the given Table object.
 */
function TableLoadTable(tbl, onrequestcomplete) {
	//console.log("[TableLoadTable] started");
	// Type Check
	TableTypeCheck(tbl);
	
	// XMLHTTPRequest
	tbl.requestComplete = false;
	tbl.request = createRequest();
	if (tbl.request.overrideMimeType) {
		tbl.request.overrideMimeType('text/xml')
	};
	
	tbl.request.onreadystatechange = function() { // Runs on Status Change
		TableRequestReadyStateChange(tbl); 
		if(tbl.requestComplete){
			onrequestcomplete.call();
		}
	};
	tbl.request.open("GET", "http://localhost/?grab=" + tbl.url, true); 
	tbl.request.send();
}

/**
 * Called when the given Table's XMLHTTPRequest readyState has changed.
 */
function TableRequestReadyStateChange(tbl){
	//console.log("[TableRequestReadyStateChange] started");
	// Type Check
	TableTypeCheck(tbl);
	
	// Check for Completion Status
	if(tbl.request.readyState === 4){
		if(tbl.request.status != 200){
			throw "Table :: Request Failed (" + tbl.request.status + ")";
		}
		
		tbl.requestComplete = true;
		
		// Get Table Element
		var page = tbl.request.responseText;
		if (page.indexOf("<table style=\"ba") == -1)
		{
			document.getElementById("oprdata").innerHTML = "<tr><td colspan=\"6\"><b>AASK cannot perform an analysis on this event.<br/>The response is malformed. We are working on a solution to the problem; thank you for your patience.</b></td></tr>";
		}
		if (page.indexOf("404") == 0)
		{
			document.getElementById("oprdata").innerHTML = "<tr><td colspan=\"6\"><b>AASK cannot perform an analysis on this event.<br/>US<em>FIRST</em>.org responded with a 404, not found error. Most likely the event has not yet begun and no data is available.</b></td></tr>";
		}
		var reltab = page.substring(page.indexOf("<table style=\"ba") + 1, page.length - 1);
		reltab = reltab.substring(reltab.indexOf("<table style=\"ba"), reltab.length - 1);
		reltab = reltab.substring(0, reltab.indexOf("</table") - 1);
		tbl.tableText = reltab;
	}
}

/** 
 * Returns the raw HTML of the given Table object.
 */
function TableGetTable(tbl) {
	//console.log("[TableGetTable] started");
	
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	return tbl.tableText;
}

/**
 * Returns the Table's headings as a String array.
 */
function TableGetHeadings(tbl) {
	//console.log("[TableGetHeadings] started");
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	// Check for Existence
	if(!tbl.headings){
		var table = tbl.tableText;
		var headings = table.substring(0, table.indexOf("font-family:arial"));
		var head = headings.substring(headings.indexOf("MsNormal") + 5, headings.length - 1).split("MsoNormal");
		var mm = new Array(head.length - 2);
		
		for (var i = 0; i < mm.length; i++) {
			mm[i] = head[i + 1];
			mm[i] = mm[i].substring(mm[i].indexOf("white;") + 8, mm[i].indexOf("<o:p"));
		}
		
		tbl.headings = mm;
	}
	
	//console.log("[TableGetHeadings] success");
	//console.log(tbl.headings);
	
	return tbl.headings;
}

/**
 * Returns the Table's body (entries) as a 2D numeric array.
 */
function TableGetBody(tbl, noNaNs) {
	//console.log("[TableGetBody] started");
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	// Ensure Headings
	if(!tbl.headings){
		TableGetHeadings(tbl);
	}
	
	// Check for Existence
	if(!tbl.body){
		var headings = tbl.headings;
		var table = tbl.tableText;
		
		var body = table.substring(table.indexOf("font-family:arial"), table.length - 1);
		var cell = body.split("\n");
		var cells = new Array(cell.length);
		var numCells = 0;
		
		for (var i = 0; i < cell.length; i++) {
			/*if (cell[i].length > 20 ... old, arbitrary way of doing it*/
			if (cell[i].indexOf("TD") >= 0 && cell[i].indexOf("</") > 0) {
				cells[numCells] = cell[i].substring(cell[i].indexOf(">") + 1, cell[i].indexOf("</"));
				numCells++;
			}
		}
		
		var k = new Array(headings.length);
		
		for (var i = 0; i < headings.length; i++) {
			k[i] = new Array(numCells / headings.length);
		}
		
		for (var i = 0; i < numCells; i++) {
			var val = parseInt(cells[i]);
			if(isNaN(val) && noNaNs) { val = 0; };
			k[i % headings.length][Math.floor(i / headings.length)] = val;
		}
		
		tbl.body = k;
	}
	
	//console.log("[TableGetBody] success");
	//console.log(tbl.body);
	
	return tbl.body;
}

/**
 * Returns the number of rows in the given Table.
 */
function TableGetRows(tbl) {
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	return tbl.body[0].length;
}

/**
 * Returns the number of columns in the given Table.
 */
function TableGetColumns(tbl) {
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	return tbl.body.length;
}

/**
 * Construct a Hashtable relating two rows of the given table.
 * @keyRowIndex The index of the row that contains entries to be used as keys
 * in the new Hashtable.
 * @valueRowIndex The index of the row that contains entries to be used as
 * values in the new Hashtable.
 */
function TableConstructRowHash(tbl, keyRowIndex, valueRowIndex) {
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	// Make Hash
	var body = tbl.body;
	var hash = Hashtable();
	
	for (var i = 0; i < body.length; i++) {
		hash.put(body[i][keyRowIndex], body[i][valueRowIndex]);
	}
	
	return hash;
}

/**
 * Construct a Hashtable relating two columns of the given table.
 * @keyColumnIndex The index of the column that contains entries to be used as
 * keys in the new Hashtable.
 * @valueColumnIndex The index of the column that contains entries to be used
 * as values in the new Hashtable.
 */
function TableConstructColumnHash(tbl, keyColumnIndex, valueColumnIndex) {
	// Type Check
	TableTypeCheck(tbl);
	TableLoadedCheck(tbl);
	
	// Make Hash
	var body = tbl.body;
	var hash = Hashtable();
	
	for (var i = 0; i < body[0].length; i++) {
		hash.put(body[keyColumnIndex][i], body[valueColumnIndex][i]);
	}
	
	return hash;
}
</script>
		<script type="text/javascript">var NL_ENTITY = "&#13;&#10;";

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

function zeros(size){
	var m = new Array(size);
	for(var i = 0; i < size; i++){
		m[i] = new Array(size);
		for(var j = 0; j < size; j++){
			m[i][j] = 0;
		}
	}
	return m;
}

function randMatrix(rows, columns){
	var m = new Array(rows);
	for(var i = 0; i < rows; i++){
		m[i] = new Array(columns);
		for(var j = 0; j < columns; j++){
			m[i][j] = Math.random();
		}
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
			if(i<matrix.length-1) { s += "\n"; };
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
</script>
		<script type="text/javascript">/**
 * MATCHPARSER.JS
 * Designed as the equivalent of MatchParser.java, which essentially holds data
 * and calculations for a single FIRST event.  It is responsible for requesting
 * and processing match data.
 * @author Ben Bray
 */

//// MATCH PARSER CONSTRUCTOR -------------------------------------------------

function MatchParser(rankingsURL, resultsURL){
	var mp = {type:"MatchParser"};
	
	// Fields
	mp.rankingsURL = rankingsURL;
	mp.resultsURL = resultsURL;
	
	// Methods
	mp.parse = function(onparsingcomplete) {
		mp.onparsingcomplete = onparsingcomplete;
		MatchParserBeginParse(mp);
	};
	
	// Return Match Parser
	return mp;
}

function MatchParserTypeCheck(mp){
	// Type Check
	if(!mp || !mp.type || !mp.type == "MatchParser"){
		throw "MatchParser :: Illegal Argument : mp is not of type 'MatchParser'";
	}
}

//// MATCH PARSER METHODS -----------------------------------------------------

function MatchParserBeginParse(mp){
	// Type Check
	MatchParserTypeCheck(mp);
	
	// Verify URL Existence
	if(!mp.rankingsURL || !mp.resultsURL){
		//throw "MatchParserParse :: Undefined URL";
	}
	
	// Create Tables
	mp.resultsTable = Table(mp.resultsURL);
	mp.rankingsTable = Table(mp.rankingsURL);
	
	// Begin Loading Results
	MatchParserLoadResults(mp);
}

/**
 * Loads the Results Table, and afterwards either loads the rankings table or
 * proceeds to the MatchParserCompleteParse() method to perform calculations.
 * @mp The MatchParser object to use.
 */
function MatchParserLoadResults(mp){
	// Type Check
	MatchParserTypeCheck(mp);
	
	if(!mp.resultsTable.requestComplete){
		if(!mp.rankingsTable.requestComplete){
			mp.resultsTable.loadTable(function() { MatchParserLoadRankings(mp); });
		} else {
			mp.resultsTable.loadTable(MatchParserCompleteParse);
		}
	}
}

/**
 * Loads the Rankings Table, and afterwards either loads the results table or
 * proceeds to the MatchParserCompleteParse() method to perform calculations.
 * @mp The MatchParser object to use.
 */
function MatchParserLoadRankings(mp){
	// Type Check
	MatchParserTypeCheck(mp);
	
	if(!mp.rankingsTable.requestComplete){
		if(!mp.resultsTable.requestComplete){
			mp.rankingsTable.loadTable(function() { MatchParserLoadResults(mp); });
		} else {
			mp.rankingsTable.loadTable(function() { MatchParserCompleteParse(mp); });
		}
	}
}

/**
 * Completes the parsing process once all Tables have been successfully loaded.
 * @mp The MatchParser object to use.
 */
function MatchParserCompleteParse(mp){
	// Type Check
	MatchParserTypeCheck(mp);
	
	// Get Table Data
	resultsBody = mp.resultsTable.getBody(true);
	rankingsBody = mp.rankingsTable.getBody(false);
	
	teamHash = mp.rankingsTable.constructColumnHash(1, 0);
	teamCount = teamHash.size();
	matchesTotal = mp.resultsTable.getRows();
	
	// Count Match Pair Frequencies
	mpf = zeros(teamCount, teamCount);
	
	for(var i = 0; i < matchesTotal; i++){
		if(resultsBody[8][i] == 0 && resultsBody[9][i] == 0) continue;
		for(var j = 2; j <= 4; j++){			// Select Row Team
			for(var k = j; k <= 4; k++){		// Select Column Team
				// Red Alliance
				var rowTeam = resultsBody[j][i];
				var rowTeamIndex = teamHash.get(rowTeam) - 1;
				var colTeam = resultsBody[k][i];
				var colTeamIndex = teamHash.get(colTeam) - 1;
				
				mpf[rowTeamIndex][colTeamIndex]++;
				if(colTeamIndex != rowTeamIndex) { mpf[colTeamIndex][rowTeamIndex]++; };
			
				// Blue Alliance
				rowTeam = resultsBody[j+3][i];
				colTeam = resultsBody[k+3][i];
				rowTeamIndex = teamHash.get(rowTeam) - 1;
				colTeamIndex = teamHash.get(colTeam) - 1;
				
				mpf[rowTeamIndex][colTeamIndex]++;
				if(colTeamIndex != rowTeamIndex) { mpf[colTeamIndex][rowTeamIndex]++; };
			}
		}
	}
	
	// Correct Diagonal Sum
	for(var i = 0; i < teamCount; i++){
		var sum = 0;
		for(var j = 0; j < teamCount; j++){
			if(i == j) continue;
			sum += mpf[j][i];
		}
		mpf[i][i] = sum / 2;
	}
	
	// Set Object Fields
	mp.resultsBody = resultsBody;
	mp.rankingsBody = rankingsBody;
	mp.teamHash = teamHash;
	mp.teamCount = teamCount;
	mp.matchesTotal = matchesTotal;
	mp.mpf = mpf;
	
	// Extract Point Values
	mp.autonPoints = new Array(teamCount);
	mp.climbPoints = new Array(teamCount);
	mp.teleopPoints = new Array(teamCount);
	mp.totalPoints = new Array(teamCount);
	
	for(var i = 0; i < teamCount; i++){
		mp.autonPoints[i] = parseInt(rankingsBody[3][i]);
		mp.climbPoints[i] = parseInt(rankingsBody[4][i]);
		mp.teleopPoints[i] = parseInt(rankingsBody[5][i]);
		mp.totalPoints[i] = mp.autonPoints[i] + mp.climbPoints[i] + mp.teleopPoints[i];
	}
	
	// Call 'onparsingcomplete'
	mp.onparsingcomplete.call();
}</script>
		<script type="text/javascript">//// AUXILIARY FUNCTIONS ------------------------------------------------------

function colorLerp(c1,c2,v)
{
  return [c1[0]*(1-v) + c2[0]*v , c1[1]*(1-v) + c2[1]*v , c1[2]*(1-v) + c2[2]*v ];
}

function colorToHex(c)
{
  var u = "0123456789ABCDEF";
  function m(x)
  {
    return Math.floor(x);
  }
  return "#" + u.charAt(m(c[0]/16)) + u.charAt(m(c[0])%16) + u.charAt(m(c[1]/16)) + u.charAt(m(c[1])%16) + u.charAt(m(c[2]/16)) + u.charAt(m(c[2])%16);
}

function getRedGreen(lo,val,hi) {
	var md = (lo + hi)/2;
	var hf = (hi - lo)/2;
	var A = [227,137,147];//[200,20,40];
	var B = [247,247,137];//[240,240,20];
	var C = [152,227,167];//[50,200,80];
	if (val < md) {
		var x = (val - lo) / hf;
		return colorToHex(colorLerp(A,B,x));
	}
	var x = (val - md) / hf;
	return colorToHex(colorLerp(B,C,x));
}

function getMaximum(array) {
	var max = array[0];
	for(var i = 1; i < array.length; i++){
		if(!isNaN(array[i]) && array[i] > max){
			max = array[i];
		}
	}
	return max;
}

function getMinimum(array) {
	var min = array[0];
	for(var i = 1; i < array.length; i++){
		if(!isNaN(array[i]) && array[i] < min){
			min = array[i];
		}
	}
	return min;
}

//// WEBSITE READER EQUIVALENT ------------------------------------------------
/**
 * Cross platform method to get XMLHttpRequest objects. Taken from an article
 * published by Brett McLaughlin.
 */
function createRequest() {
	var request;
	try{
		request = new XMLHttpRequest();
	} catch(trymicrosoft) {
		try{
			request = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(othermicrosoft){
			try{
				request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(failed) {
				request = false;
			}
		}
	}
	
	// Ensure Request Existence
	if(!request) {
		alert("Unfortunately, your browser cannot utilize AASK. Please enable, or switch to a browser with, XMLHttpRequests! (Chrome, Opera, Safari, IE, others)");
	}
	
	return request;
}


//// JAVASCRIPT-Y STUFF BELOW -------------------------------------------------

var frcEvent;
var autonEC;
var climbEC;
var teleopEC;
var totalEC;

/**
 * Synch call so that the page doesn't freeze when it starts;
 * reduces page load time at the cost of causing a "waiting for data" message
 * to be displayed for a second.
 */
function Main() {
	
	frcEvent = MatchParser(rankingsPage, resultsPage);
	frcEvent.parse(compute);
	
	// Display Waiting Message
	document.getElementById("oprdata").innerHTML = "<tr><td colspan=\"6\"><em>Waiting for data from www2.USFIRST.org...</em></td></tr>";
}

function compute(){
	// Compute Estimated Contributions
	autonEC = solveLU(frcEvent.mpf, frcEvent.autonPoints);
	climbEC = solveLU(frcEvent.mpf, frcEvent.climbPoints);
	teleopEC = solveLU(frcEvent.mpf, frcEvent.teleopPoints);
	totalEC = solveLU(frcEvent.mpf, frcEvent.totalPoints);
	
	/*autonEC = gaussSeidel(frcEvent.mpf, frcEvent.autonPoints);
	climbEC = gaussSeidel(frcEvent.mpf, frcEvent.climbPoints);
	teleopEC = gaussSeidel(frcEvent.mpf, frcEvent.teleopPoints);
	totalEC = gaussSeidel(frcEvent.mpf, frcEvent.totalPoints);*/
	
	var estimate = multiplyMatVec(frcEvent.mpf, totalEC);
	var residual = subtractVec(estimate, frcEvent.totalPoints);
	var squaredError = residual[0];
	for(var i = 1; i < residual.length; i++){
		squaredError += residual[i] * residual[i];
	}
	
	// Minimum & Maximum Values, for Coloring
	autonEC.min = getMinimum(autonEC);
	autonEC.max = getMaximum(autonEC);
	climbEC.min = getMinimum(climbEC);
	climbEC.max = getMaximum(climbEC);
	teleopEC.min = getMinimum(teleopEC);
	teleopEC.max = getMaximum(teleopEC);
	totalEC.min = getMinimum(totalEC);
	totalEC.max = getMaximum(totalEC);
	
	// Table
	populateTables();
}

/**
 * The results are in!  Create the table!
 */
function populateTables() {
	// Estimated Contributions Table
	var s = "";
	for (var row = 0; row < frcEvent.rankingsBody[0].length; row++) {
		var mx = frcEvent.teamCount;
		var mn = 1;
		var rk = frcEvent.rankingsBody[0][row];
		s += "<tr>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:" + getRedGreen(mn, mx-rk, mx) +  "\">" + frcEvent.rankingsBody[0][row] + "</td>" +
			"<td style=\"background:" + getRedGreen(autonEC.min, autonEC[row], autonEC.max) + "\">" + autonEC[row].toFixed(2) + "</td>" +
			"<td style=\"background:" + getRedGreen(climbEC.min, climbEC[row], climbEC.max) + "\">" + climbEC[row].toFixed(2) + "</td>" +
			"<td style=\"background:" + getRedGreen(teleopEC.min, teleopEC[row], teleopEC.max) + "\">" + teleopEC[row].toFixed(2) + "</td>" +
			"<td style=\"background:" + getRedGreen(totalEC.min, totalEC[row], totalEC.max) + "\">" + totalEC[row].toFixed(2) + "</td>";
	}
	
	document.getElementById("oprdata").innerHTML = s;
	setupTable(document.getElementById("oprtable"));
	
	// Match Prediction Table
	/*s = "";
	for (var row = 0; row < frcEvent.rankingsBody[0].length; row++) {
		var mx = frcEvent.teamCount;
		var mn = 1;
		var rk = frcEvent.rankingsBody[0][row];
		s += "<tr>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>" +
			"<td style=\"background:#EEEEEE;\">" + frcEvent.rankingsBody[1][row] + "</td>";
	}
	
	document.getElementById("matchdata").innerHTML = s;
	//setupTable(document.getElementById("matchtable"));*/
}
</script>
		<link href="<?php bloginfo('template_directory');?>/css/scouting.css" rel="stylesheet" type="text/css">
	</head>
	<body style="padding-left:32px; padding-right:32px; width:800px; margin-left:auto; margin-right:auto;">
		<h1>Adambots Automated Scouting Kit</h1>
		The Adambots Automated Scouting Kit (AASK) automatically generates estimations of the ability of robots at competition. It utilizes the estimation of solutions to linear equations to predict expected contributions.<br/><br/>
		This system is produced in Javascript by Adambots team members for any <em>FIRST</em> robotics teams to use!
		<br/>
		<br/>
		Click the table headings to sort the table.<br/>
		<br/>
		
		<div id="change-selection" style="height:35px; text-align:center;">
			Select Competition:
			<select id="compselector" style="height:35px;outline:none;vertical-align:top;"></select>
			<button id="goToComp" style="width:50px;height:35px;">Go!</button>
			
			<script>
				var competitionList = [
					["BAE Systems Granite State Regional","2013comp/Events/NHMA/rankings.html","2013comp/Events/NHMA/matchresults.html"],
					["Finger Lakes Regional","2013comp/Events/NYRO/rankings.html","2013comp/Events/NYRO/matchresults.html"],
					["Palmetto Regional","2013comp/Events/SCMB/rankings.html","2013comp/Events/SCMB/matchresults.html"],
					["Hub City Regional","2013comp/Events/TXLU/rankings.html","2013comp/Events/TXLU/matchresults.html"],
					["Central Valley Regional","2013comp/Events/CAMA/rankings.html","2013comp/Events/CAMA/matchresults.html"],
					["Kettering University District","2013comp/Events/MIKET/rankings.html","2013comp/Events/MIKET/matchresults.html"],
					["Traverse City District","2013comp/Events/MITVC/rankings.html","2013comp/Events/MITVC/matchresults.html"],
					["Hatboro-Horsham District","2013comp/Events/PAHAT/rankings.html","2013comp/Events/PAHAT/matchresults.html"],
					["Greater Toronto East Regional","2013comp/Events/ONTO/rankings.html","2013comp/Events/ONTO/matchresults.html"],
					["San Diego Regional","2013comp/Events/CASD/rankings.html","2013comp/Events/CASD/matchresults.html"],
					["Orlando Regional","2013comp/Events/FLOR/rankings.html","2013comp/Events/FLOR/matchresults.html"],
					["WPI Regional","2013comp/Events/MAWO/rankings.html","2013comp/Events/MAWO/matchresults.html"],
					["Lake Superior Regional","2013comp/Events/MNDU/rankings.html","2013comp/Events/MNDU/matchresults.html"],
					["Northern Lights Regional","2013comp/Events/MNDU2/rankings.html","2013comp/Events/MNDU2/matchresults.html"],
					["New York City Regional","2013comp/Events/NYNY/rankings.html","2013comp/Events/NYNY/matchresults.html"],
					["Autodesk Oregon Regional","2013comp/Events/ORPO/rankings.html","2013comp/Events/ORPO/matchresults.html"],
					["Lone Star Regional","2013comp/Events/TXHO/rankings.html","2013comp/Events/TXHO/matchresults.html"],
					["Gull Lake District","2013comp/Events/MIGUL/rankings.html","2013comp/Events/MIGUL/matchresults.html"],
					["Waterford District","2013comp/Events/MIWFD/rankings.html","2013comp/Events/MIWFD/matchresults.html"],
					["Israel Regional","2013comp/Events/ISTA/rankings.html","2013comp/Events/ISTA/matchresults.html"],
					["Montreal Regional","2013comp/Events/QCMO/rankings.html","2013comp/Events/QCMO/matchresults.html"],
					["Peachtree Regional","2013comp/Events/GADU/rankings.html","2013comp/Events/GADU/matchresults.html"],
					["Boilermaker Regional","2013comp/Events/INWL/rankings.html","2013comp/Events/INWL/matchresults.html"],
					["Greater Kansas City Regional","2013comp/Events/MOKC/rankings.html","2013comp/Events/MOKC/matchresults.html"],
					["St. Louis Regional","2013comp/Events/MOSL/rankings.html","2013comp/Events/MOSL/matchresults.html"],
					["North Carolina Regional","2013comp/Events/NCRE/rankings.html","2013comp/Events/NCRE/matchresults.html"],
					["Pittsburgh Regional","2013comp/Events/PAPI/rankings.html","2013comp/Events/PAPI/matchresults.html"],
					["Virginia Regional","2013comp/Events/VARI/rankings.html","2013comp/Events/VARI/matchresults.html"],
					["Detroit District","2013comp/Events/MIDET/rankings.html","2013comp/Events/MIDET/matchresults.html"],
					["St. Joseph District","2013comp/Events/MISJO/rankings.html","2013comp/Events/MISJO/matchresults.html"],
					["TCNJ District","2013comp/Events/NJEWN/rankings.html","2013comp/Events/NJEWN/matchresults.html"],
					["Springside - Chestnut Hill District","2013comp/Events/PAPHI/rankings.html","2013comp/Events/PAPHI/matchresults.html"],
					["Waterloo Regional","2013comp/Events/ONWA/rankings.html","2013comp/Events/ONWA/matchresults.html"],
					["Phoenix Regional","2013comp/Events/AZCH/rankings.html","2013comp/Events/AZCH/matchresults.html"],
					["Sacramento Regional","2013comp/Events/CASA/rankings.html","2013comp/Events/CASA/matchresults.html"],
					["Los Angeles Regional sponsored by The Roddenberry Foundation","2013comp/Events/CALB/rankings.html","2013comp/Events/CALB/matchresults.html"],
					["Bayou Regional","2013comp/Events/LAKE/rankings.html","2013comp/Events/LAKE/matchresults.html"],
					["Boston Regional","2013comp/Events/MABO/rankings.html","2013comp/Events/MABO/matchresults.html"],
					["Queen City Regional","2013comp/Events/OHIC/rankings.html","2013comp/Events/OHIC/matchresults.html"],
					["Dallas Regional","2013comp/Events/TXDA/rankings.html","2013comp/Events/TXDA/matchresults.html"],
					["Utah Regional co-sponsored by the Larry H. Miller Group & Platt","2013comp/Events/UTWV/rankings.html","2013comp/Events/UTWV/matchresults.html"],
					["Central Washington Regional","2013comp/Events/WASE2/rankings.html","2013comp/Events/WASE2/matchresults.html"],
					["Wisconsin Regional","2013comp/Events/WIMI/rankings.html","2013comp/Events/WIMI/matchresults.html"],
					["West Michigan District","2013comp/Events/MIWMI/rankings.html","2013comp/Events/MIWMI/matchresults.html"],
					["Grand Blanc District","2013comp/Events/MIGBL/rankings.html","2013comp/Events/MIGBL/matchresults.html"],
					["Mount Olive District","2013comp/Events/NJFLA/rankings.html","2013comp/Events/NJFLA/matchresults.html"],
					["Lenape Seneca District","2013comp/Events/NJLEN/rankings.html","2013comp/Events/NJLEN/matchresults.html"],
					["Greater Toronto West Regional","2013comp/Events/ONTO2/rankings.html","2013comp/Events/ONTO2/matchresults.html"],
					["Inland Empire Regional","2013comp/Events/CASB/rankings.html","2013comp/Events/CASB/matchresults.html"],
					["Connecticut Regional sponsored by UTC","2013comp/Events/CTHA/rankings.html","2013comp/Events/CTHA/matchresults.html"],
					["Washington DC Regional","2013comp/Events/DCWA/rankings.html","2013comp/Events/DCWA/matchresults.html"],
					["South Florida Regional","2013comp/Events/FLBR/rankings.html","2013comp/Events/FLBR/matchresults.html"],
					["Minnesota 10000 Lakes Regional","2013comp/Events/MNMI/rankings.html","2013comp/Events/MNMI/matchresults.html"],
					["Minnesota North Star Regional","2013comp/Events/MNMI2/rankings.html","2013comp/Events/MNMI2/matchresults.html"],
					["Buckeye Regional","2013comp/Events/OHCL/rankings.html","2013comp/Events/OHCL/matchresults.html"],
					["Oklahoma Regional","2013comp/Events/OKOK/rankings.html","2013comp/Events/OKOK/matchresults.html"],
					["Smoky Mountains Regional","2013comp/Events/TNKN/rankings.html","2013comp/Events/TNKN/matchresults.html"],
					["Alamo Regional sponsored by Rackspace Hosting","2013comp/Events/TXSA/rankings.html","2013comp/Events/TXSA/matchresults.html"],
					["Seattle Regional","2013comp/Events/WASE/rankings.html","2013comp/Events/WASE/matchresults.html"],
					["Livonia District","2013comp/Events/MILIV/rankings.html","2013comp/Events/MILIV/matchresults.html"],
					["Troy District","2013comp/Events/MITRY/rankings.html","2013comp/Events/MITRY/matchresults.html"],
					["Western Canadian Regional","2013comp/Events/ABCA/rankings.html","2013comp/Events/ABCA/matchresults.html"],
					["Razorback Regional","2013comp/Events/ARFA/rankings.html","2013comp/Events/ARFA/matchresults.html"],
					["Silicon Valley Regional","2013comp/Events/CASJ/rankings.html","2013comp/Events/CASJ/matchresults.html"],
					["Colorado Regional","2013comp/Events/CODE/rankings.html","2013comp/Events/CODE/matchresults.html"],
					["Hawaii Regional sponsored by BAE Systems","2013comp/Events/HIHO/rankings.html","2013comp/Events/HIHO/matchresults.html"],
					["Midwest Regional","2013comp/Events/ILCH/rankings.html","2013comp/Events/ILCH/matchresults.html"],
					["Crossroads Regional","2013comp/Events/INTH/rankings.html","2013comp/Events/INTH/matchresults.html"],
					["Pine Tree Regional","2013comp/Events/MELE/rankings.html","2013comp/Events/MELE/matchresults.html"],
					["Las Vegas Regional","2013comp/Events/NVLV/rankings.html","2013comp/Events/NVLV/matchresults.html"],
					["SBPLI Long Island Regional","2013comp/Events/NYLI/rankings.html","2013comp/Events/NYLI/matchresults.html"],
					["Spokane Regional","2013comp/Events/WACH/rankings.html","2013comp/Events/WACH/matchresults.html"],
					["Bedford District","2013comp/Events/MIBED/rankings.html","2013comp/Events/MIBED/matchresults.html"],
					["Bridgewater-Raritan District","2013comp/Events/NJBRG/rankings.html","2013comp/Events/NJBRG/matchresults.html"],
					["Chesapeake Regional","2013comp/Events/MDBA/rankings.html","2013comp/Events/MDBA/matchresults.html"],
					["Michigan State Championship","2013comp/Events/MICMP/rankings.html","2013comp/Events/MICMP/matchresults.html"],
					["Mid-Atlantic Robotics Regional Championship","2013comp/Events/MRCMP/rankings.html","2013comp/Events/MRCMP/matchresults.html"],
					["Archimedes Championship","2013comp/Events/Archimedes/rankings.html","2013comp/Events/Archimedes/matchresults.html"],
					["Curie Championship","2013comp/Events/Curie/rankings.html","2013comp/Events/Curie/matchresults.html"],
					["Galileo Championship","2013comp/Events/Galileo/rankings.html","2013comp/Events/Galileo/matchresults.html"],
					["Newton Championship","2013comp/Events/Newton/rankings.html","2013comp/Events/Newton/matchresults.html"]
				];
				
				var compselector = document.getElementById("compselector");
				var goToComp = document.getElementById("goToComp");
				var s = "";
				
				for (var i = 0; i < competitionList.length; i++) {
					s += "<option id='event" + competitionList[i][0].split(" ").join("").split("-").join("") +"'>" + competitionList[i][0] + "</option>";
				}
				
				compselector.innerHTML = s;
				var url = document.URL;
				url = url.split("?");
				url[1] = !url[1] ? [] : url[1].split("&");
				
				for (var i = 0; i < url[1].length; i++) {
					url[1][i] = url[1][i].split("=");
				}
				
				url = {"url" : url[0], "params" : url[1], "param" : {}};
				
				for (var i = 0; i < url.params.length; i++) {
					url.param[url.params[i][0]] = url.params[i][1];
				}
				
				if (url.param.comp) {
					document.getElementById("event" + url.param.comp.split(" ").join("").split("-").join("")).selected = "selected";
				}
				
				goToComp.onclick = function() {
					window.location = url.url + "?comp=" + (compselector.options[compselector.selectedIndex].innerHTML).split(" ").join("-");
				}

				var eventName = competitionList[i][0];
				var rankingsPage = competitionList[i][1];
				var resultsPage = competitionList[i][2];
				
				for (var i = 0; i < competitionList.length; i++) {
					if ((url.param.comp||"").split("-").join("") == competitionList[i][0].split(" ").join("").split("-").join("")){
						eventName = competitionList[i][0];
						rankingsPage = competitionList[i][1];
						resultsPage = competitionList[i][2];
					}
				}
				</script>
			</div>

		<br/>
		<div style="border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;">
			<table class="shinytable" id="oprtable" data-sorting="iidddd">
				<thead>
					<tr>
						<td colspan="6">
						<script>document.write(eventName + " Estimated Contributions");</script>
						</td>
					</tr>
					<tr>
						<td>Team*</td>
						<td>Ranking*</td>
						<td>Autonomous Pts.**</td>
						<td>Climb Pts.**</td>
						<td>Teleoperated Pts.**</td>
						<td>Total Pts.**</td>
					</tr>
				</thead>
				<tbody id="oprdata">
					<tr><td colspan="6"><em>Waiting for script to load...</em></td></tr>
				</tbody>
				<tfoot>
					<tr><td colspan="6">
					*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
					**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.</td></tr>
				</tfoot>
			</table>
		</div>

		<!--<br/>
		
		<div style="border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;">
			<table class="shinytable" id="matchtable">
				<thead>
					<tr>
						<td colspan="9">
							<script>document.write(eventName + " Match Predictions")</script>
						</td>
					</tr>
					<tr>
						<td>Match</td>
						<td>Red 1</td>
						<td>Red 2</td>
						<td>Red 3</td>
						<td>Blue 1</td>
						<td>Blue 2</td>
						<td>Blue 3</td>
						<td>Est. Red Score**</td>
						<td>Est. Blue Score**</td>
					</tr>
				</thead>
				<tbody id="matchdata">
					<tr><td colspan="9"><em>Waiting for script to load...</em></td></tr>
				</tbody>
				<tfoot>
					<tr><td colspan="9">
					*Data from <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a><br/>
					**These numbers are calculated and only estimates. They represent the expected average score that <em>this</em> team will score <em>alone</em> in a match.</td></tr>
				</tfoot>
			</table>
		</div>-->
		
		<br/>
		<div style="height:70px;"></div>
		<br/>
		
<h2>How Does This Work?</h2>
		<p>For each point category, our system solves a system of linear equations for the "average contribution" of each team per match.  Each equation corresponds to
		a single team and expresses the total accumulated points earned by that team as a linear combination of that team's average contribution and the average 
		contributions of every other team that has competed on an alliance with that team.  Naturally, we represent the system of equations with a single matrix equation
		of the form <code>Ax=b</code>
		
		<ul>
			<li>Vector <code>b</code> contains the aggregate point value for each team.</li>
			<li>Each element <code>A(i,j)</code> of matrix <code>A</code> represents the number of times team <code>i</code> has played with team <code>j</code>.
				Each element on the diagonal, therefore, is the total number of matches played by the team represented by that row and column.  As a result, our
				matrix has the following properties:
				<ul>
					<li>It is symmetric.</li>
					<li>It is (very loosely speaking) diagonally dominant.</li>
					<li>It is always nonsingular.</li>
				</ul>
			</li>
			<li>We solve for the vector <code>x</code>, which contains the average contribution of each team.</li>
		</ul>
		
		<p>Because of the special properties of our matrix, we can easily find an exact solution using LU Factorization (without pivoting!) followed by forward- and back-substitution.</p>
		
		<p>This Javascript implementation is dependent on the match and rankings reported by <a href="http://www.usfirst.org">www.US<em>FIRST.org</em></a>.<br/>
		Example pages for the 2013 Grand Blanc competition:
		<ul>
			<li><a href="http://www2.usfirst.org/2013comp/Events/MIGBL/rankings.html">http://www2.usfirst.org/2013comp/Events/MIGBL/rankings.html</a></li>
			<li><a href="http://www2.usfirst.org/2013comp/events/MIGBL/matchresults.html">http://www2.usfirst.org/2013comp/events/MIGBL/matchresults.html</a></li>
		</ul>

		<h2>Want Source Code?</h2>
		This project is available on <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">GitHub</a>. It is available in <a href="https://github.com/benrbray/adambots-automated-scouting-kit/">web</a> and <a href="https://github.com/benrbray/adambots-automated-scouting-kit/tree/master/java">Java</a> forms.<br/>
		<br/>
		Licensed use:<br/>
			The <em>Adambots Automated Scouting Kit (AASK)</em> is free software: you can redistribute it and/or modify
			it under the terms of the GNU General Public License as published by
			the Free Software Foundation, either version 3 of the License.
		<br/>
			AASK is distributed in the hope that it will be useful,
			but WITHOUT ANY WARRANTY; without even the implied warranty of
			MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
			GNU General Public License for more details.
		<br/>
			You should have received a copy of the GNU General Public License
			along with AASK.  If not, see &lt;http://www.gnu.org/licenses/&gt;.

		<script type="text/javascript">Main();</script>
	</body>
</html>
