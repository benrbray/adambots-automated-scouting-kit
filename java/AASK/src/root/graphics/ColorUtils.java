package root.graphics;

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
	
	//// INTERPOLATION --------------------------------------------------------
	
	public static int lerpRGB(int hexA, int hexB, int low, int high, int value){
		int dR = ((hexB & RED_MASK)		- (hexA & RED_MASK));
		int dG = ((hexB & GREEN_MASK)	- (hexA & GREEN_MASK));
		int dB = ((hexB & BLUE_MASK)	- (hexA & BLUE_MASK));
		double ratio = (double)(value-low) / (high-low);
		return (hexA + (int)(dR * ratio) + (int)(dG * ratio) + (int)(dB * ratio));
	}
}
