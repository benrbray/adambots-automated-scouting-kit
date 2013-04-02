//// FRCEvent -----------------------------------------------------------------

/**
Represents all of the pages and data necessary for all of the calculations about an Event.

baseurl: e.g., 2013comp/Events/MIGBL

.pageRankings a Page for rankings.html
.pageMatches a Page for matchresults.html

.qualtable a Table for the qualification matches on matchresults.html (Will be undefined if the competition is not begun)
.elimtable a Table for the elimination matches on matchresults.html (MAY BE UNDEFINED IF THEY HAVE NO YET BEGUN)
.rankingstable a Table for the data on rankings.html

**/
function FRCEvent(baseurl,eventname,callback) {
	this.callback = callback;
	this.url = baseurl;
	this.eventname = eventname;
	this.status = "Downloading data.";
	this.pageRankings = new Page(baseurl + "rankings.html"); //Generate the table for Rankings
	this.pageMatches = new Page(baseurl + "matchresults.html"); //Generate the table for the match results
	var me = this;
	this.waitForData = function() {
		//Me is used instead of "this" because this function is called via setTimeout.
		//That means "this" is the window.
		//Apparently, "public" calls that I make to the object (me) get their "this" back though, so the rest uses normal "this".
		if (me.pageMatches.ready && me.pageRankings.ready) {
			me.status = "Data collected. Preparing for processing.";
			me.prepare();
		} else {
			setTimeout(me.waitForData,100);
		}
	}
	/**
	Do surface level processing: getting all of the tables set up and things.
	Then, move on to "process()".
	**/
	this.prepare = function() {
		//Do stuff with this.pageRankings and this.pageMatches
		this.qualtable = this.pageMatches.tables[0];
		this.elimtable = this.pageMatches.tables[1];
		this.rankingstable = this.pageRankings.tables[0];
		this.process();
	}
	
	/**
	Do all computations here, including building matricies and things.
	Output NOTHING. Just provide data outlets.
	**/
	this.process = function() {
		this.status = "Processing data.";
		this.ready = true;
		if (this.callback) {
			this.callback(this);
		}
	}
	setTimeout(this.waitForData,100);
}