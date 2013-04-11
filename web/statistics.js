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

function mean(X){
	if(isMatrix(X)){
		X = X.toSingleArray();
	}
	
	var sum = 0;
	for(var i = 0; i < X.length; i++){
		sum += X[i];
	}
	
	return sum / X.length;
}

/**
 * Computes the sample variance of X. Matrices are converted to
 * single-dimensional arrays for calculation.
 */
function variance(X){
	if(isMatrix(X)){
		X = X.toSingleArray();
	}
	
	var avg = mean(X);
	var sumSquaredDifference = 0;
	for(var i = 0; i < X.length; i++){
		var diff = X[i] - avg;
		sumSquaredDifference += diff * diff;
	}
	
	return (sumSquaredDifference / (X.length-1));
}

/**
 * Computes the sample standard deviation of X. Matrices are converted to
 * single-dimensional arrays for calculation.
 */
function std(X){
	return Math.sqrt(variance(X));
}

/**
 * Computes the covariance between X and Y.  Matrices are converted to
 * single-dimensional arrays for calculation.
 */
function covariance(X, Y){
	var xVec;
	var yVec;
	
	// Cast
	if(isMatrix(X)){
		xVec = X.toSingleArray();
	} else if(X instanceof Array){
		xVec = X;
	}
	
	if(isMatrix(Y)){
		yVec = Y.toSingleArray();
	} else if(Y instanceof Array){
		yVec = Y;
	}
	
	// Check Length
	if(xVec.length != yVec.length){
		throw "Covariance can only be calculated between vectors of the same length!";
	}
	
	// Average
	var xMean = 0;
	var yMean = 0;
	for(var i = 0; i < xVec.length; i++){
		xMean += xVec[i];
		yMean += yVec[i];
	}
	xMean /= xVec.length;
	yMean /= yVec.length;
	
	// Difference Product
	var cov = 0;
	for(var i = 0; i < yVec.length; i++){
		var diff = (xVec[i] - xMean) * (yVec[i] - yMean);
		cov += diff;
	}
	cov /= (xVec.length - 1);
	
	// Result
	return cov;
}

/**
 * Computes the correlation coefficient of X and Y.  Matrices are converted to
 * single-dimensional arrays for calculation.
 *
 * correlation(X,Y) := covariance(X,Y) / (std(X) * std(Y))
 */
function correlation(X, Y){
	return (covariance(X, Y) / (std(X)*std(Y)));
}

/**
 * Calculates the normal probability density of the given points and returns
 * them as an array of (X,Y) pairs for graphing.
 */
function normPDFPoints(support, mu, sigma){
	// Validate
	if(isMatrix(support)){
		support = support.toSingleArray();
	}
	
	var sigmaSquared = sigma * sigma; // Variance
	var coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
	
	var pts = [];
	for(var i = 0; i < support.length; i++){
		var dev = support[i] - mu;
		pts[i] = [support[i], coeff * Math.exp(-(dev*dev) / (2*sigmaSquared) )];
	}
	return pts;
}

/**
 * Calculates the normal probability density of all points in the given range
 * and returns them as an array of (X,Y) pairs for graphing.
 */
function normPDFRange(min, max, mu, sigma, resolution){
	if(!resolution) { resolution = 1; };
	var range = max - min;
	var n = Math.floor(range / resolution);
	var pts = new Array(n);
	var sigSquared = sigma * sigma;
	var coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
	for(var i = 0; i < n; i++){
		var x = min + i * resolution;
		var dev = x - mu;
		pts[i] = [x, coeff * Math.exp(-(dev*dev) / (2*sigSquared) )];
	}
	return pts;
}