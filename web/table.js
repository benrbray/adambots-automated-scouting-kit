/************** equivalent to TABLE.JAVA **************/
//Distr. under GNU GPL

/**
 * Mimick the Table object so that less of the other classes change. Use without 'new'.
 * The URL is either RANKINGS or MATCHES, depending on the desired data.  It is NOT
 * the actual URL; this name is kept for consistency's sake.
 */
function Table(url) {
	var r = [];
	r.getTable = function(){ return TableGetTable(url); };
	r.getHeading = function(){return TableGetHeading(url);};
	r.getBody = function(){return TableGetBody(url);};
	r.constructColumnHash = function(a,b) {return TableConstructColumnHash(url,a,b);};
	r.constructRowHash = function(a,b) {return TableConstructRowHash(url,a,b);};
	r.getRows = function() {return TableGetRows(url); };
	r.getColumns = function() {return TableGetColumns(url)};
	return r;
} 

function TableGetRows(url) {
	return TableGetTable(url)[0].length;
}

function TableGetColumns(url) {
	return TableGetTable(url).length;
}

function TableConstructColumnHash(url,keyrow,valrow) {
	var u = [];
	u.get = function(f) {return u[f]; };
	var body = TableGetBody(url);
	for (var i = 0; i < body.length; i++)
	{
		u[body[i][keyrow]] = body[i][valrow];
	}
	return u;
}

function TableConstructRowHash(url,keycol,valcol) {
	var u = [];
	u.get = function(f) {return u[f]; };
	var body = TableGetBody(url);
	for (var i = 0; i < body[0].length; i++)
	{
		u[body[keycol][i]] = body[valcol][i];
	}
}

function TableGetTable(url) {
	var page = "";
	if (url == "RANKINGS") {
		page = RANKINGS;
	}
	if (url == "MATCHES") {
		page = MATCHES;
	}
	var reltab = page.substring(page.indexOf("<table style=\"ba") + 1, page.length - 1);
	reltab = reltab.substring(reltab.indexOf("<table style=\"ba"), reltab.length - 1);
	reltab = reltab.substring(0, reltab.indexOf("</table") - 1);
	return reltab;
}

function TableGetHeading(url) {
	var table = TableGetTable(url);
	
	var heading = table.substring(0, table.indexOf("font-family:arial"));
	var head = heading.substring(heading.indexOf("MsNormal") + 5, heading.length - 1).split("MsoNormal");
	var mm = new Array(head.length - 2);
	for (var i = 0; i < mm.length; i++) {
		mm[i] = head[i + 1];
		mm[i] = mm[i].substring(mm[i].indexOf("white;") + 8, mm[i].indexOf("<o:p"));
	}
	return mm;
}

function TableGetBody(url) {
	var heading = TableGetHeading(url);
	var table = TableGetTable(url);
	var body = table.substring(table.indexOf("font-family:arial"), table.length - 1);
	var cell = body.split("\n");
	var cells = new Array(cell.length);
	var o = 0;
	
	for (var i = 0; i < cell.length; i++) {
		if (cell[i].length > 20 && cell[i].indexOf("</") > 0) {
			cells[o] = cell[i].substring(cell[i].indexOf(">") + 1, cell[i].indexOf("</"));
			o++;
		}
	}
	
	//double[][] k = new double[heading.length][o / heading.length];
	var k = new Array(heading.length);
	for (var i = 0; i < heading.length; i++)
	{
		k[i] = new Array(o / heading.length);
	}
	for (var i = 0; i < o; i++) {
		k[i % heading.length][Math.floor(i / heading.length)] = parseInt(cells[i]);
	}
	return k;
}
