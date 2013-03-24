/********* Website Reader equivalent **********/

var request;
function createRequest() {
/*Cross platform method to get XMLHttpRequest objects, taken form article published by Brett McLaughlin*/
try{request=new XMLHttpRequest();}catch(trymicrosoft){try{request=new ActiveXObject("Msxml2.XMLHTTP");}catch(othermicrosoft){try{request=new ActiveXObject("Microsoft.XMLHTTP");}catch(failed){request=false;}}}if(!request)alert("Unfortunately, your browser cannot utilize AASK. Please enable, or switch to a browser with, XMLHttpRequests! (Chrome, Opera, Safari, IE, others)");
}


/********** Javascript-y stuff below ***********/

var RANKINGS = "";
var MATCHES = "";

function Main4()
{
//The results ARE IN (in RANKINGS and MATCHES).
}

function Main3()
{
/*The request data is received, so parsing and computation can begin.*/
if (request.readyState == 4) // the results actually have come in
{
MATCHES = request.responseText;
document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\">" + RANKINGS.length + "</td></tr>";
Main4();
}
}

function Main2()
{
if (request.readyState == 4) // the results actually have come in
{
RANKINGS = request.responseText;
createRequest();
request.open("GET","?grab=2013comp/events/MIGBL/matchresults.html",true); 
request.onreadystatechange = Main3; /*Proceed to here to actually start working*/
request.send();
}
}

function Main()
{
/*Ran by a script at the bottom of the page (so that means the document is here)*/
createRequest();
request.open("GET","?grab=2013comp/events/MIGBL/rankings.html",true); 
/*Synch call so that the page doesn't freeze when it starts;
reduces page load time at the cost of causing a "waiting for data" message to be displayed for a second*/
request.onreadystatechange = Main2; /*Proceed to here to actually start working*/
request.send();
}
