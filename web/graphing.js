function plotAxis(ctx,minx,maxx,miny,maxy,axx,axy,title) {
	ctx.pad = 50;
	var pad = ctx.pad;
	function round(x) {
		var base = Math.pow(10,Math.floor( Math.log(x) / Math.log(10 ) ));
		var u = Math.ceil(x/base);
		if (u == 3 && x/base <= 2.5) {
			u = 2.5;
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
	
	ctx.font = "12px Arial";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	
	var step = round(40 / (ctx.canvas.width - pad*2) * (maxx - minx));
	for (var i = minx; i < maxx + step; i += step)
	{
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo( pad + (ctx.canvas.width - pad*2) * (i-minx) / (maxx-minx), ctx.canvas.height - pad);
		ctx.lineTo( pad + (ctx.canvas.width - pad*2) * (i-minx) / (maxx-minx), ctx.canvas.height - pad + 5);
		ctx.stroke();
		ctx.fillStyle = "#999999";
		ctx.fillStyle = "black";
		ctx.fillText(i,pad + (ctx.canvas.width - pad*2) * (i-minx) / (maxx-minx), ctx.canvas.height - pad + 17);
	}
	
	
	var step = round(40 / (ctx.canvas.height - pad*2) * (maxy - miny));
	for (var i = miny; i < maxy + step; i += step)
	{
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo( pad , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
		ctx.lineTo( pad - 5 , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
		ctx.stroke();
		
		ctx.fillStyle = "#999999";
		ctx.fillStyle = "black";
		ctx.fillText(i,pad - 17 , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny) );
		
		if (i > miny) {
			ctx.strokeStyle = "#CCCCCC";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo( pad , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
			ctx.lineTo( ctx.canvas.width - pad , (ctx.canvas.height - pad) - (i - miny) * (ctx.canvas.height - pad*2) / (maxy - miny)  );
			ctx.stroke();
		}
	}
	
	ctx.fillStyle = "black";
	ctx.font = "bold 12px Arial";
	ctx.fillText(axx, (ctx.canvas.width)/2, ctx.canvas.height - pad + 17 + 17); //x axis
	ctx.save();
	ctx.translate( pad - 17 - 17, (ctx.canvas.height)/2 );
	ctx.rotate(-Math.PI/2);
	ctx.fillText(axy,0,0);
	ctx.restore();
	
	ctx.font = "bold 14px Arial";
	ctx.fillText(title,ctx.canvas.width/2,pad/2);
}

function plotCurve(ctx,pts,color,nodots) {
	var miny = ctx.miny;
	var maxy = ctx.maxy;
	var minx = ctx.minx;
	var maxx = ctx.maxx;
	function convx(x) {
		return (x - minx) / (maxx - minx) * (ctx.canvas.width - ctx.pad*2) + ctx.pad;
	}
	
	function convy(y) {
		return ctx.canvas.height - ctx.pad - ((y - miny) / (maxy - miny) * (ctx.canvas.height - ctx.pad*2));
	}
	
	ctx.lineWidth = 10;
	ctx.lineJoin = "bevel";
	ctx.strokeStyle = "white";
	ctx.beginPath();
	ctx.moveTo(convx(pts[0][0]),convy(pts[0][1]));
	for (var i = 1; i < pts.length; i++) {
		ctx.lineTo(convx(pts[i][0]),convy(pts[i][1]));
	}
	ctx.stroke();
	ctx.lineJoin = "miter";
	ctx.lineWidth = 4;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(convx(pts[0][0]),convy(pts[0][1]));
	for (var i = 1; i < pts.length; i++) {
		ctx.lineTo(convx(pts[i][0]),convy(pts[i][1]));
	}
	ctx.stroke();
	if (!nodots) {
		for (var i = 0; i < pts.length; i++) {
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.arc(convx(pts[i][0]),convy(pts[i][1]),7,0,6.28);
			ctx.fill();
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.arc(convx(pts[i][0]),convy(pts[i][1]),5,0,6.28);
			ctx.fill();
		}
	}
}