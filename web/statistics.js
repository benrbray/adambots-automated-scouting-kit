/**
 * Computes the sample variance of X. Matrices are converted to
 * single-dimensional arrays for calculation.
 */
function variance(X){
	var vec;
	
	if(isMatrix(X)){
		vec = X.toSingleArray();
	} else if(X instanceof Array){
		vec = X;
	}
	
	var mean = 0;
	for(var i = 0; i < vec.length; i++){
		mean += vec[i];
	}
	mean /= vec.length;
	
	var sumSquaredDifference = 0;
	for(var i = 0; i < vec.length; i++){
		var diff = vec[i] - mean;
		sumSquaredDifference += diff * diff;
	}
	
	return (sumSquaredDifference / (vec.length-1));
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