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

/**
 * Prepares a graph context and draws the axes.
 * @param ctx The canvas's context (canvas.getContext("2d"))
 * @param minx The minimum x to be shown on the xaxis (often either 0 or the minimum x of the dataset)
 * @param maxx The maximum x to be shown (often the maximum x of the dataset)
 * @param miny The min. y (often either 0 or the minimum y of the data set)
 * @param maxy The max. y (often 1.25 * the max. y, or something similar)
 * @param axx Name of the x axis
 * @param axy Name of the y axis
 * @param title Name of graph (optional)
 * @param noxtics If TRUE, no ticks or interval labels are displayed for the horizontal axis.
 * @param nottics If TRUE, no ticks or interval labels are displayed for the vertical axis.
 * @param nogrey If TRUE, no gray subinterval lines will be displayed
 **/
function plotAxis(ctx,minx,maxx,miny,maxy,axx,axy,title,noxtics,noytics,nogrey) {
	if (!ctx) {
		return;
	}
	if (!title) {
		title = "";
	}
	ctx.lines = 1;
	ctx.pad = 50;
	var pad = ctx.pad;
	function round(x) {
		var base = Math.pow(10,Math.floor( Math.log(x) / Math.log(10 ) ));
		var u = Math.ceil(x/base);
		if (u == 3 && x/base <= 2.5) {
			u = 2.5;
		}
		if (u > 5) {
			u = 1;
			base = base * 10;
		}
		return u*base;
	}
	ctx.lineJoin = "miter";
	ctx.strokeStyle = "#CCCCCC";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(pad,pad);
	ctx.lineTo(pad, ctx.canvas.height - pad);
	ctx.lineTo(ctx.canvas.width - pad,ctx.canvas.height - pad);
	ctx.stroke();
	
	ctx.minx = minx;
	ctx.miny = miny;
	ctx.maxx = maxx;
	ctx.maxy = maxy;

	function convx(x) {
		return (x - minx) / (maxx - minx) * (ctx.canvas.width - ctx.pad*2) + ctx.pad;
	}
	
	function convy(y) {
		return ctx.canvas.height - ctx.pad - ((y - miny) / (maxy - miny) * (ctx.canvas.height - ctx.pad*2));
	}
	
	ctx.font = "12px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.right = maxx;
	ctx.top = maxy;

	
	var step = round(20 / (ctx.canvas.width - pad*2) * (maxx - minx));
	for (var i = minx; i < maxx + step; i += step) { 
		ctx.right = i;
	}		

	var step = round(40 / (ctx.canvas.height - pad*2) * (maxy - miny));
	for (var i = miny; i < maxy + step; i += step) { 
		ctx.top = i;
	}		

	ctx.maxx = ctx.right;
	maxx = ctx.maxx;
	ctx.maxy = ctx.top;
	maxy = ctx.maxy;
	
	if (!noxtics) {
		var step = round(20 / (ctx.canvas.width - pad*2) * (maxx - minx));
		for (var i = minx; i < maxx + step; i += step)
		{
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.moveTo( pad + (ctx.canvas.width - pad*2) * (i-minx) / (maxx-minx), ctx.canvas.height - pad);
			ctx.lineTo( pad + (ctx.canvas.width - pad*2) * (i-minx) / (maxx-minx), ctx.canvas.height - pad + 5);
			ctx.stroke();
			ctx.fillStyle = "#999999";
			ctx.fillStyle = "black";
			ctx.textAlign = "center";
			ctx.fillText(i,pad + (ctx.canvas.width - pad*2) * (i-minx) / (maxx-minx), ctx.canvas.height - pad + 17);
			ctx.right = i;
		}
	}
	
	var step = round(20 / (ctx.canvas.height - pad*2) * (maxy - miny));
	for (var i = miny; i < maxy + step; i += step)
	{
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo( pad , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
		ctx.lineTo( pad - 5 , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
		if (!noytics) {
			ctx.stroke();
		}
		
		ctx.fillStyle = "#999999";
		ctx.fillStyle = "black";

		ctx.textAlign = "right";
		if (!noytics) {
			ctx.fillText(i,pad - 7 , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny) );
		}
		if ((i > miny) && (!nogrey)) {
			ctx.strokeStyle = "#CCCCCC";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo( pad , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
			ctx.lineTo( ctx.canvas.width - pad , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
			ctx.stroke();
		}
		ctx.top = i;
	}
	ctx.textAlign = "center";

	ctx.fillStyle = "black";
	ctx.font = "bold 12px Arial";
	ctx.fillText(axx, (ctx.canvas.width)/2, ctx.canvas.height - pad + 17 + 17); //x axis
	ctx.save();
	ctx.translate( pad - 17 - 17 - 5, (ctx.canvas.height)/2 );
	ctx.rotate(-Math.PI/2);
	ctx.fillText(axy,0,0);
	ctx.restore();
	
	ctx.font = "bold 14px Arial";
	ctx.fillText(title,ctx.canvas.width/2,pad/2);

	ctx.lineWidth = 2;
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo( convx(minx) , convy(ctx.top) );
	ctx.lineTo( convx(minx) , convy(miny) );
	ctx.lineTo( convx(ctx.right) , convy(miny) );
	ctx.stroke();
}

/**
 * (note: plotAxis must be called before plotCurve in order to set up the graph)
 * @param ctx the canvas's context (see plotAxis)
 * @param pts An array of arrays; each object in pts is in the form [x,y]
 * @param color a CSS color for the curve, e.g. "purple" or "#EECCBB" or 
 * "rgba(127,255,200,0.8)"
 * @param nodots If true, then the dots will not be shown at each data point. 
 * Recommended for when data is very dense horizontally or when data is very 
 * smooth.  Otherwise, optional.
 */
function plotCurve(ctx, pts, color, nodots) {
	if (!ctx) {
		return;
	}
	var miny = ctx.miny;
	var maxy = ctx.maxy;
	var minx = ctx.minx;
	var maxx = ctx.maxx;

	pts.sort(function(a,b) { return a[0] - b[0]; } );

	function convx(x) {
		return (x - minx) / (maxx - minx) * (ctx.canvas.width - ctx.pad*2) + ctx.pad;
	}
	
	function convy(y) {
		return ctx.canvas.height - ctx.pad - ((y - miny) / (maxy - miny) * (ctx.canvas.height - ctx.pad*2));
	}
	
	// White
	ctx.lineWidth = 10 * ctx.lines;
	ctx.lineJoin = "bevel";
	ctx.strokeStyle = "white";
	ctx.beginPath();
	var moved = false;
	
	for (var i = 0; i < pts.length; i++) {
		if(pts[i][0] < minx || pts[i][0] > ctx.right) { continue; };
		var y = pts[i][1] = Math.max(miny, Math.min(ctx.top, pts[i][1])); 
		
		if(!moved){
			ctx.moveTo(convx(pts[i][0]),convy(y));
			moved = true;
		} else {
			ctx.lineTo(convx(pts[i][0]),convy(y));
		}
	}
	
	// Color
	ctx.stroke();
	ctx.lineJoin = "miter";
	ctx.lineWidth = 4 * ctx.lines;
	ctx.strokeStyle = color;
	ctx.beginPath();
	moved = false;
	
	for (var i = 0; i < pts.length; i++) {
		if(pts[i][0] < minx || pts[i][0] > ctx.right) { continue; };
		var y = pts[i][1] = Math.max(miny, Math.min(ctx.top, pts[i][1])); 
		
		if(!moved){
			ctx.moveTo(convx(pts[i][0]),convy(y));
			moved = true;
		} else {
			ctx.lineTo(convx(pts[i][0]),convy(y));
		}
	}
	ctx.stroke();
	if (!nodots) {
		for (var i = 0; i < pts.length; i++) {
			if(pts[i][0] < minx || pts[i][0] > ctx.right) { continue; };
			var y = pts[i][1] = Math.max(miny, Math.min(ctx.top, pts[i][1])); 
			
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.arc(convx(pts[i][0]),convy(y),7,0,6.28);
			ctx.fill();
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.arc(convx(pts[i][0]),convy(pts[i][1]),5,0,6.28);
			ctx.fill();
		}
	}
}

/** 
 * Plots a normal curve for the given dataset.
 * @param ctx The Canvas context to draw on.
 * @param data The number of standard deviations to plot.
 * @param color Line color.
 * @param resolution The amount of plot detail.  A value of one will plot points an interval of one pixel apart.
 */
function plotNormal(ctx, data, deviations, color, resolution){
	// Validate
	if(isMatrix(data)){
		data = data.toSingleArray();
	}
	if(!deviations){ deviations = 3; };
	if(!resolution){ resolution = 1; };
	
	var mu = mean(data);		// Mean
	var sigma = std(data);	// Standard Deviation
	var sigmaSquared = sigma * sigma; // Variance
	
	console.log("Mu:  " + mu + ", Sigma:  " + sigma);
	
	var minX = mu - (deviations * sigma);
	var maxX = mu + (deviations * sigma);
	var range = maxX - minX;
	var coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
	
	var pts = [];
	for(var i = 0; i < range; i += resolution){
		var xVal = minX + i;
		var dev = xVal - mu;
		pts[i] = [xVal, coeff * Math.exp(-(dev*dev) / (2*sigmaSquared) )];
		console.log(pts[i][0] + " = " + pts[i][1]);
	}
	
	plotCurve(ctx, pts, color, true);
}