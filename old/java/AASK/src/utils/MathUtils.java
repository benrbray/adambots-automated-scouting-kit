package utils;

public class MathUtils {
	//// CONSTANTS ------------------------------------------------------------
	
	public static long TENS[] = new long[19];
	
	//// STATIC INITIALIZER ---------------------------------------------------
	
	static {
		// Tens
		for(int i = 1; i < TENS.length; i++){
			TENS[i] = 10 * TENS[i-1];
		}
	}
	
	//// ROUNDING -------------------------------------------------------------
	
	public static double round(double v, int precision){
		assert precision >= 0 && precision < TENS.length;
		double unscaled = v * TENS[precision];
		if(unscaled < Long.MIN_VALUE || unscaled > Long.MAX_VALUE) return v;
		long unscaledLong = (long)(unscaled + (v < 0 ? -0.5 : 0.5));
		return (double) unscaledLong / TENS[precision];
	}
}
