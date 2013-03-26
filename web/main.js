/***** aux functions *****/

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


function getWarmCold(lo,val,hi)
{
  var md = (lo + hi)/2;
  var hf = (hi - lo)/2;
  var A = [227,137,147];//[200,20,40];
  var B = [247,247,137];//[240,240,20];
  var C = [152,227,167];//[50,200,80];
  if (val < md)
  {
    var x = (val - lo) / hf;
    return colorToHex(colorLerp(A,B,x));
  }
  var x = (val - md) / hf;
  return colorToHex(colorLerp(B,C,x));
}

function getMaximum(ar)
{
  var u = ar.slice(0);
  u.reverse();
  return u[0];
}
function getMinimum(ar)
{
  var u = ar.slice(0);
  return u[0];
}


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
  var u = Table("RANKINGS").getBody();
  var s = "";
  for (var row = 0; row < u[0].length; row++)
  {
    var mx = getMaximum(u[0]);
    var mn = getMinimum(u[0]);
    var rk = u[0][row];
    s += "<tr><td style=\"background:#EEEEEE;\">" + u[1][row] + "</td><td style=\"background:" + getWarmCold( mn ,mx - rk, mx ) +  "\">" + u[0][row] + "</td><td colspan='4'></td></tr>";
  }
  document.getElementById("thedata").innerHTML = s;
  setTimeout("tableSetup(document.getElementById(\"thetable\"))",1);
}

function Main3()
{
  /*The request data is received, so parsing and computation can begin.*/
  if (request.readyState == 4) // the results actually have come in
  {
    MATCHES = request.responseText;
    document.getElementById("thedata").innerHTML = "<tr><td colspan=\"6\">" + "ERROR IN FETCHING RESULTS" + "</td></tr>";
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
