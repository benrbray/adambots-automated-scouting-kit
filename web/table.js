	function Table(url) { //Mimick the Table object so that less of the other classes change. Use without 'new'
		//URL is either "RANKINGS" or "MATCHES" referring to which table you want.
		/**It is NOT the actual URL**/
		var r = [];
		r.getTable = function(){ return TableGetTable(url); };
		r.getHeading = function(){return TableGetHeading(url);};
		r.getBody = function(){return TableGetBody(url);};
		//constructcolumnhash
		//constructrowhash
		//get height / width of table, too.
		return r;
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
