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

function getRedGreen(lo,val,hi) {
  var md = (lo + hi)/2;
	var hf = (hi - lo)/2;
	var A = [227,137,147];//[200,20,40];
	var B = [247,247,137];//[240,240,20];
	var C = [152,227,167];//[50,200,80];
	if (val < md) {
		var x = (val - lo) / hf;
		return colorToHex(colorLerp(A,B,x));
	}
	var x = (val - md) / hf;
	return colorToHex(colorLerp(B,C,x));
}

function getMaximum(array) {
	var max = array[0];
	for(var i = 1; i < array.length; i++){
		if(array[i] > max){
			max = array[i];
		}
	}
	return max;
}

function getMinimum(array) {
	var min = array[0];
	for(var i = 1; i < array.length; i++){
		if(array[i] < min){
			min = array[i];
		}
	}
	return min;
}
