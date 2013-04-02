//a not very nicely done table sorting library
//Requires that TR's have no attributes
//Requires thead, tbody, tfoot have no attributes
//Will add an empty thead / tfoot / tbody if there was not one, I think
//Requires a call to tableSetup( table element )

var tablelastsort = 1;

function clickcol(a)
{
	a = tabledata[a];
	var table = a.table;
	var sortby = a.sortby;
	
	var m = 1;
	if (a.sorting == "d")
	{
		m = -1;
	}
	
	if (tablelastsort == a.unique)
	{
		tablelastsort = -1;
		m = m * -1;
	}
	else
	{
		tablelastsort = a.unique;
	}
	
	var ne = sortTableRows(table.rows,sortby,m);
	table.innerHTML = ne;
	var ne = sortTableRows(table.rows,sortby,m);
	table.innerHTML = ne;
	tablehist = a;
	
}

var tabledata = [];

function getValFromRow(rw,c)
{
	return parseFloat(rw.childNodes[c].innerHTML +"");
}

function sortTableRows(rows,col,mul)
{
	var hed = [];
	var bdy = [];
	var fot = [];
	for (var i = 0; i < rows.length; i++)
	{
		var r = rows[i];
		if (r.parentNode.nodeName == "THEAD")
		{
			hed[hed.length] = "<tr>" + r.innerHTML + "</tr>\n";
		}
		if (r.parentNode.nodeName == "TBODY")
		{
			bdy[bdy.length] = r;
			//bdy[bdy.length] += "<tr>" +  r.innerHTML + "</tr>\n";
		}
		if (r.parentNode.nodeName == "TFOOT")
		{
			fot[fot.length] = "<tr>" + r.innerHTML + "</tr>\n";
		}
	}
	var srt = bdy.sort(
		function(a,b) {
			return (getValFromRow(a,col) - getValFromRow(b,col))*mul;
		}	
	);
	for (var i = 0; i < srt.length; i++)
	{
		srt[i] = "<tr>" + srt[i].innerHTML + "</tr>";
	}
	return "<thead>" + hed.join("") + "</thead><tbody>" +  srt.join("") + "</tbody><tfoot>" + fot.join("") + "</tfoot>";
}

function tableGetRows(tab) {
	var rows = [];
	var n = tab.childNodes;
	for (var i = 0; i < n.length; i++)
	{
		var m = n[i];
		if (m.nodeName.substring(0,1) == "T")
		{
			m = m.childNodes;
			for (var o = 0; o < m.length; o++) {
				if (m[o].nodeName == "TR")
				{
					rows[rows.length] = m[o];
				}
			}
		}
	}
	return rows;
}

function setupTable(tab)
{
	var sorting = tab.getAttribute("data-sorting");
	var rows = tableGetRows(tab);
	var bdy = [];
	var hed = [];
	for (var i = 0; i < rows.length; i++)
	{
		var r = rows[i];
		if (r.parentNode.nodeName == "THEAD")
		{
			hed[hed.length] = r;
		}
		if (r.parentNode.nodeName == "TBODY")
		{
			bdy[bdy.length] = r;
		}
	}
	hed = hed[hed.length-1].childNodes;
	var hed2 = [];
	for (var i = 0; i < hed.length; i++)
	{
		if (hed[i].nodeName == "TD")
		{
			hed2[hed2.length] = hed[i];
		}
	}
	hed = hed2;
	for (var i = 0; i < hed.length; i++)
	{
		var col = hed[i]; //a TD
		var k = [];
		k.sorting = sorting.charAt(i);
		k.table = tab;
		k.sortby = i;
		k.unique = tabledata.length;
		tabledata[tabledata.length] = k;//[col,bdy,hed,tab];
		col.innerHTML = "<a style=\"color:black;cursor:pointer;text-decoration:underline;\" onclick=\"clickcol(" + (tabledata.length-1) + ");return false;\">" + col.innerHTML + "</a>";
	}
}
