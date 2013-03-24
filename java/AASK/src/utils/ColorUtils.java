package utils;

public final class ColorUtils {
	//// CONSTANTS ------------------------------------------------------------
	
	// Color Masks
	private static int RED_SHIFT	= 16;
	private static int GREEN_SHIFT	= 8;
	private static int BLUE_SHIFT	= 0;
	private static int ALPHA_MASK	= 0xFF000000;
	private static int RED_MASK		= 0x00FF0000;
	private static int GREEN_MASK	= 0x0000FF00;
	private static int BLUE_MASK	= 0x000000FF;
	
	// Hex Helpers
	private static String HEX_CHARS	= "0123456789ABCDEF";
	
	//// INTERPOLATION --------------------------------------------------------
	
	public static int[] colorLerp(int[] c1, int[] c2, double v) {
		return new int[] {(int) (c1[0]*(1-v) + c2[0]*v) , (int) (c1[1]*(1-v) + c2[1]*v) , (int) (c1[2]*(1-v) + c2[2]*v) };
	}

	public static int[] threeColorGradient(int colorLow, int colorMed, int colorHigh, double lo, double val, double hi) {
		double md = (lo + hi)/2;
		double hf = (hi - lo)/2;
		int[] A = { (colorLow>>16)&0xFF, (colorLow>>8)&0xFF, colorLow&0xFF };
		int[] B = { (colorMed>>16)&0xFF, (colorMed>>8)&0xFF, colorMed&0xFF };
		int[] C = { (colorHigh>>16)&0xFF, (colorHigh>>8)&0xFF, colorHigh&0xFF };
		if (val < md) {
			double x = (val - lo) / hf;
			return colorLerp(A,B,x);
		}
		double x = (val - md) / hf;
		return colorLerp(B,C,x);
	}

	// Cold/Warm Three-Color Gradient (Blue -> White -> Red)
	
	public static int[] getColdWarm(double lo, double val, double hi){
		return threeColorGradient(0x6E90DD, 0xFFFFFF, 0xDD6E6E, lo, val, hi);
	}
	
	public static int[] getColdWarm(double lo, double val, double hi, boolean reverse){
		return threeColorGradient(reverse?0xDD6E6E:0x6E90DD, 0xFFFFFF, reverse?0x6E90DD:0xDD6E6E, lo, val, hi);
	}
	
	// Three-Color Gradient (Red -> Yellow -> Green)
	
	public static int[] getRedGreen(double lo, double val, double hi){
		return threeColorGradient(0xFF7F7F, 0xE5E572, 0x7BB75B, lo, val, hi);
	}
	
	public static int[] getRedGreen(double lo, double val, double hi, boolean reverse){
		return threeColorGradient(reverse?0x7BB75B:0xFF7F7F, 0xE5E572, reverse?0xFF7F7F:0x7BB75B, lo, val, hi);
	}
	
	
	/**
	 * Returns a String representation of the given color, specified as an RGB integer array.
	 * @param components
	 * @return
	 */
	public static String colorToHexString(int[] components){
		return colorToHexString(components[0], components[1], components[2]);
	}
	
	/**
	 * Returns a String representation of the given color, specified as a hex integer.
	 * @param hex
	 * @return
	 */
	public static String colorToHexString(int hex){
		return colorToHexString((hex>>16)&0xFF, (hex>>8)&0xFF, hex&0xFF);
	}
	
	/**
	 * Returns a String representation of the given color components..
	 * @param r Red component.
	 * @param g Green component.
	 * @param b Blue Component.
	 * @return Hex string.
	 */
	public static String colorToHexString(int r, int g, int b){
		return "#" + HEX_CHARS.charAt(r/16) + HEX_CHARS.charAt(r%16) + HEX_CHARS.charAt(g/16) + HEX_CHARS.charAt(g%16) + HEX_CHARS.charAt(b/16) + HEX_CHARS.charAt(b%16);
	}
}
