//// TABLE.JAVA EQUIVALENT ----------------------------------------------------

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
