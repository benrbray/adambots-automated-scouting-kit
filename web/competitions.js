var competitionList = [
	["BAE Systems Granite State Regional","2013comp/Events/NHMA/"],
	["Finger Lakes Regional","2013comp/Events/NYRO/"],
	["Palmetto Regional","2013comp/Events/SCMB/"],
	["Hub City Regional","2013comp/Events/TXLU/"],
	["Central Valley Regional","2013comp/Events/CAMA/"],
	["Kettering University District","2013comp/Events/MIKET/"],
	["Traverse City District","2013comp/Events/MITVC/"],
	["Hatboro-Horsham District","2013comp/Events/PAHAT/"],
	["Greater Toronto East Regional","2013comp/Events/ONTO/"],
	["San Diego Regional","2013comp/Events/CASD/"],
	["Orlando Regional","2013comp/Events/FLOR/"],
	["WPI Regional","2013comp/Events/MAWO/"],
	["Lake Superior Regional","2013comp/Events/MNDU/"],
	["Northern Lights Regional","2013comp/Events/MNDU2/"],
	["New York City Regional","2013comp/Events/NYNY/"],
	["Autodesk Oregon Regional","2013comp/Events/ORPO/"],
	["Lone Star Regional","2013comp/Events/TXHO/"],
	["Gull Lake District","2013comp/Events/MIGUL/"],
	["Waterford District","2013comp/Events/MIWFD/"],
	["Israel Regional","2013comp/Events/ISTA/"],
	["Montreal Regional","2013comp/Events/QCMO/"],
	["Peachtree Regional","2013comp/Events/GADU/"],
	["Boilermaker Regional","2013comp/Events/INWL/"],
	["Greater Kansas City Regional","2013comp/Events/MOKC/"],
	["St. Louis Regional","2013comp/Events/MOSL/"],
	["North Carolina Regional","2013comp/Events/NCRE/"],
	["Pittsburgh Regional","2013comp/Events/PAPI/"],
	["Virginia Regional","2013comp/Events/VARI/"],
	["Detroit District","2013comp/Events/MIDET/"],
	["St. Joseph District","2013comp/Events/MISJO/"],
	["TCNJ District","2013comp/Events/NJEWN/"],
	["Springside - Chestnut Hill District","2013comp/Events/PAPHI/"],
	["Waterloo Regional","2013comp/Events/ONWA/"],
	["Phoenix Regional","2013comp/Events/AZCH/"],
	["Sacramento Regional","2013comp/Events/CASA/"],
	["Los Angeles Regional sponsored by The Roddenberry Foundation","2013comp/Events/CALB/"],
	["Bayou Regional","2013comp/Events/LAKE/"],
	["Boston Regional","2013comp/Events/MABO/"],
	["Queen City Regional","2013comp/Events/OHIC/"],
	["Dallas Regional","2013comp/Events/TXDA/"],
	["Utah Regional co-sponsored by the Larry H. Miller Group & Platt","2013comp/Events/UTWV/"],
	["Central Washington Regional","2013comp/Events/WASE2/"],
	["Wisconsin Regional","2013comp/Events/WIMI/"],
	["West Michigan District","2013comp/Events/MIWMI/"],
	["Grand Blanc District","2013comp/Events/MIGBL/"],
	["Mount Olive District","2013comp/Events/NJFLA/"],
	["Lenape Seneca District","2013comp/Events/NJLEN/"],
	["Greater Toronto West Regional","2013comp/Events/ONTO2/"],
	["Inland Empire Regional","2013comp/Events/CASB/"],
	["Connecticut Regional sponsored by UTC","2013comp/Events/CTHA/"],
	["Washington DC Regional","2013comp/Events/DCWA/"],
	["South Florida Regional","2013comp/Events/FLBR/"],
	["Minnesota 10000 Lakes Regional","2013comp/Events/MNMI/"],
	["Minnesota North Star Regional","2013comp/Events/MNMI2/"],
	["Buckeye Regional","2013comp/Events/OHCL/"],
	["Oklahoma Regional","2013comp/Events/OKOK/"],
	["Smoky Mountains Regional","2013comp/Events/TNKN/"],
	["Alamo Regional sponsored by Rackspace Hosting","2013comp/Events/TXSA/"],
	["Seattle Regional","2013comp/Events/WASE/"],
	["Livonia District","2013comp/Events/MILIV/"],
	["Troy District","2013comp/Events/MITRY/"],
	["Western Canadian Regional","2013comp/Events/ABCA/"],
	["Razorback Regional","2013comp/Events/ARFA/"],
	["Silicon Valley Regional","2013comp/Events/CASJ/"],
	["Colorado Regional","2013comp/Events/CODE/"],
	["Hawaii Regional sponsored by BAE Systems","2013comp/Events/HIHO/"],
	["Midwest Regional","2013comp/Events/ILCH/"],
	["Crossroads Regional","2013comp/Events/INTH/"],
	["Pine Tree Regional","2013comp/Events/MELE/"],
	["Las Vegas Regional","2013comp/Events/NVLV/"],
	["SBPLI Long Island Regional","2013comp/Events/NYLI/"],
	["Spokane Regional","2013comp/Events/WACH/"],
	["Bedford District","2013comp/Events/MIBED/"],
	["Bridgewater-Raritan District","2013comp/Events/NJBRG/"],
	["Chesapeake Regional","2013comp/Events/MDBA/"],
	["Michigan State Championship","2013comp/Events/MICMP/"],
	["Mid-Atlantic Robotics Regional Championship","2013comp/Events/MRCMP/"],
	["Archimedes Championship","2013comp/Events/Archimedes/"],
	["Curie Championship","2013comp/Events/Curie/"],
	["Galileo Championship","2013comp/Events/Galileo/"],
	["Newton Championship","2013comp/Events/Newton/"]
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
var eventURL = competitionList[i][1];
//var rankingsPage = competitionList[i][1];
//var resultsPage = competitionList[i][2];

for (var i = 0; i < competitionList.length; i++) {
	if ((url.param.comp||"").split("-").join("") == competitionList[i][0].split(" ").join("").split("-").join("")){
		eventName = competitionList[i][0];
		eventURL = competitionList[i][1];
		//rankingsPage = competitionList[i][1];
		//resultsPage = competitionList[i][2];
	}
}