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

//// TABLE CONSTRUCTOR --------------------------------------------------------

/**
 * A "Table" occurs on a page when consecutive rows of data contains numbers. The row immediately before the data-rows is used as a heading.
 * 
 * heading/headings/header/headers :: String[] The names of the columns (in caps) of the data.
 * data :: Int[row][col]  The data filling the cells. NaNs in most cases where there are no parseable numbers.
 * raw :: String[row][col] the text filling the cells. data[row][col] == parseFloat(raw[row][col]), essentially.
 */
function Table(heading,raw,data) {
	this.heading = this.headings = this.header = this.headers = heading;
	this.raw = raw;
	this.data = data;
}

//// WEBSITE SCRAPER ----------------------------------------------------------

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

//// PAGE CONSTRCUTOR ---------------------------------------------------------

/**
 * Constructors a "page" object with .tables representing the list of "data tables" on the page.
 *
 * url: The url after the domain to parse, e.g. "2013comp/Events/MIGBL/rankings.html"
 *
 * obj.tables :: Table[] of data tables appearing on page.
 * obj.ready :: bool True when the data has been parsed and placed into the tables array.
 */
function Page(url) {
	function outoftag(str) {
		//e.g
		//<a>b<c><d>efg</k></m><n>o</p>
		//returns
		//befgo
		var intag = false; //whether or not position [i] is in an html tag (between < and >)
		var quoted = false; //whether or not position [i] is in an attribute in a tag between < X "i" >
		var text = ""; //The text collected to return. Spaces between tags? Nope. Silly. Of course not.
		for (var i = 0; i < str.length; i++) {
			var ch = str.charAt(i);
			if (!intag) {
				//outside of a tag
				if (ch == "<") {
					intag = true;
				}
				else
				{
					text = text + ch;
				}
			} else {
				//INSIDE of a tag.
				if (!quoted) {
					//Not already IN a quote.
					if (ch == "\""){
						quoted = true;
					}
					if (ch == ">") {
						intag = false;
					}
				}else{
				//Inside of a quote, waiting for a ".
					if (ch == "\"") {
						quoted = false;
						
					}
				}
			}
		}
		return text;
	}
	var me = this;
	this.returnto = function() {
		if (me.r.readyState != 4) {
			return;
		}
		var text = me.r.responseText.toUpperCase();
		var rows = text.split("<TR"); //I do NOT want the first one (prior to the start of a <TR>:
		rows.splice(0,1); //Remove the first one.
		for (var i = 0; i < rows.length; i++) {
			rows[i] = rows[i].substring(0, rows[i].indexOf("</TR") ); //Stop when the row ends. Requires a </TR> pairing to each <TR>.
			//Not sure whether or not valid HTML requires it. May be a poor requirement, but fairly predictable and reliable.
			rows[i] = rows[i].substring(rows[i].indexOf(">") + 1,rows[i].length); //I don't want anything between "<TR" and ">".
			rows[i] = " " + rows[i].trim() + " ";
		}
		var raw = []; // raw[row][col] == string content of cell
		var data = []; //data[row][col] == int content (or NaN). bool data[row].hasdata means that there are numbers in this row (not just text / headings &c)
		for (var i = 0; i < rows.length; i++) {
			//Split up the TD's...
			raw[i] = [];
			data[i] = [];
			var cols = rows[i].split("<TD");
			cols.splice(0,1);
			for (var u = 0; u < cols.length; u++) {
				cols[u] = " <TD" + cols[u]; //Reattach for the purpose of the 'outoftag'
				cols[u] = outoftag(cols[u].substring(0,cols[u].indexOf("</TD"))); //get content not inside tags.
				raw[i][u] = cols[u].trim(); //Fill the body! 'raw' refers to EVERY ROW COL pair.
				data[i][u] = parseFloat(raw[i][u]);
				var isnumber = raw[i][u].replace(/[0123456789\.]/g,"").trim() == ""; //contains only the decimal, spaces, and numbers.
				if (isnumber && !isNaN(data[i][u])) {
					data[i].hasdata = true;
				}
			}
		}
		me.tables = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i].hasdata) {
			//New table!!!!!!!!!!!!
				var ra = [];
				var dat = [];
				for (var u = i; u < data.length; u++) {
					if (!data[u].hasdata) {
						me.tables[me.tables.length] = new Table(raw[i-1] , ra,dat );
						i = u;
						break;
					} else {
						ra[ra.length] = raw[u];
						dat[dat.length] = data[u];
					}
				}
			}
		}
		me.ready = true;
	}
	this.r = createRequest();
	this.r.open("GET","?grab=" + url,true);
	this.r.onreadystatechange = this.returnto;
	this.r.send();
}
