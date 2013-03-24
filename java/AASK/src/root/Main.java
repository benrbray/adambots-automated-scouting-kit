package root;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Hashtable;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import root.graphics.ColorUtils;

import Jama.Matrix;

public class Main {
	//// CONSTANTS ------------------------------------------------------------
	
	
	
	//// CONSTRUCTOR ----------------------------------------------------------
	
	public static void main(String[] args) {
		Main m = new Main();
	}
	
	public Main(){
		// Initialize
		init();
	}

	//// INITIALIZATION -------------------------------------------------------
	
	public String getColor(int color1, int color2, int color3, double low, double val, double hi) {
		val = Math.max(low,Math.min(hi,val));
		double r = 0;
		double g = 0;
		double b = 0;
		int r1 = (color1>>16) & 0xFF;
		int r2 = (color2>>16) & 0xFF;
		int r3 = (color3>>16) & 0xFF;
		int g1 = (color1>>8) & 0xFF;
		int g2 = (color2>>8) & 0xFF;
		int g3 = (color3>>8) & 0xFF;
		int b1 = color1 & 0xFF;
		int b2 = color2 & 0xFF;
		int b3 = color3 & 0xFF;
		//50,200,80
		//240,240,20
		//200,20,40
		double wei = 0;
		if (val < (low + hi)/2)
		{
			wei = (val - low) / Math.abs(hi - low) * 2;
			r = r2*wei + r1*(1-wei);
			g = g2*wei + g1*(1-wei);
			b = b2*wei + b1*(1-wei);			
		}
		else
		{
			wei = (val - (low + hi)/2) / Math.abs(hi - low) * 2;
			r = r3*wei + r2*(1-wei);
			g = g3*wei + g2*(1-wei);
			b = b3*wei + b2*(1-wei);
		}
		return makeHex((int)r,(int)g,(int)b);
	}
	
	String makeHex(int a,int b,int c){
		String f = "0123456789ABCDEF";
		return "#" + f.charAt(a/16) + f.charAt(a%16) + f.charAt(b/16) + f.charAt(b%16) + f.charAt(c/16) + f.charAt(c%16);
	}
	
	String truncate(double u,int a){
		String m = u + "";
		if (m.indexOf(".") == -1)
		{
			return m;
		}
		return m.substring(0,(int)Math.min(m.length()-1,m.indexOf(".") + a+1));
	}
	
	public void init(){
		// Parse Data
		MatchParser event = new MatchParser("http://www2.usfirst.org/2013comp/events/MIGBL/");
		
		// Get Data
		Hashtable<Integer, Integer> teamHash = event.getTeamHash();
		Table teamStandings = event.getTeamStandings();
		Matrix autonEC = event.getAutonContributions();
		Matrix climbEC = event.getClimbContributions();
		Matrix teleopEC = event.getTeleopContributions();
		Matrix totalEC = event.getTotalContributions();
		
		// Print Data
		
		double[] totalr = {totalEC.get(0,0),totalEC.get(0,0)};
		double[] climbr = {climbEC.get(0,0),climbEC.get(0,0)};
		double[] autonr = {autonEC.get(0,0),autonEC.get(0,0)};
		double[] teleopr = {teleopEC.get(0,0),teleopEC.get(0,0)};
		
		System.out.println("Team\tAP\tCP\tTP\tTOTAL");
		for(int i = 0; i < autonEC.getRowDimension(); i++){
			System.out.printf("%d\t%1.2f\t%1.2f\t%1.2f\t%1.2f\t\n", 
							   (int)teamStandings.getBody()[1][i], 
							   autonEC.get(i, 0), 
							   climbEC.get(i, 0), 
							   teleopEC.get(i, 0), 
							   totalEC.get(i, 0)); 
			totalr[0] = Math.min(totalr[0],totalEC.get(i,0));
			totalr[1] = Math.max(totalr[1],totalEC.get(i,0));
			
			climbr[0] = Math.min(climbr[0],climbEC.get(i,0));
			climbr[1] = Math.max(climbr[1],climbEC.get(i,0));
			
			autonr[0] = Math.min(autonr[0],autonEC.get(i,0));
			autonr[1] = Math.max(autonr[1],autonEC.get(i,0));
			
			teleopr[0] = Math.min(teleopr[0],teleopEC.get(i,0));
			teleopr[1] = Math.max(teleopr[1],teleopEC.get(i,0));
			
		}
		String s = "<style>.results tr td {border-right:1px solid #222222; border-bottom:1px solid #222222;}  .results .heading td {border-color:#CCCCCC; border-bottom: 2px solid #BBBBBB;}   </style><div style='width:504px;border:1px solid #EEEEEE; padding:1px;'><table class=\"results\" cellspacing='0' style='font-family:Calibri;text-align:center;border:1px solid #CCCCCC;'><tbody>";
		s = s + "<tr class=\"heading\" style='background:#EEEEEE;'><td style='width:50px; border-bottom:1px solid #CCCCCC;'>Team</td><td style='width:50px'>Standing</td><td style='width:100px;'>Autonomous</td><td style='width:100px;'>Climb</td><td style='width:100px;'>Teleop</td><td style='width:100px;'>Total</td></tr>";
		
		int color1 = 0x32C850;
		int color2 = 0xC8F014;
		int color3 = 0xC81428;
		for (int i = 0; i < autonEC.getRowDimension(); i++)
		{
			s = s + "<tr>";
			s = s + "<td style=\"border-right:2px solid #BBBBBB; border-bottom:1px solid #CCCCCC; background:"  + "#EEEEEE" + "\">" + (int)teamStandings.getBody()[1][i] + "</td>";
			s = s + "<td style=\"background:" + getColor(color1, color2, color3, 1, autonEC.getRowDimension()-(i+1), autonEC.getRowDimension())+ "\">" + (i+1) + "</td>";
			s = s + "<td style=\"background:" + getColor(color1, color2, color3, autonr[0], autonEC.get(i,0), autonr[1]) + "\">" + truncate(autonEC.get(i,0),2) + "</td>";
			s = s + "<td style=\"background:" + getColor(color1, color2, color3, climbr[0], climbEC.get(i,0), climbr[1]) + "\">" + truncate(climbEC.get(i,0),2) + "</td>";
			s = s + "<td style=\"background:" + getColor(color1, color2, color3, teleopr[0], teleopEC.get(i,0), teleopr[1]) + "\">" + truncate(teleopEC.get(i,0),2) + "</td>";
			s = s + "<td style=\"background:" + getColor(color1, color2, color3, totalr[0], totalEC.get(i,0), totalr[1]) + "\">" + truncate(totalEC.get(i,0),2) + "</td>";
			s = s + "</tr>";
		}
		s = s + "</tbody></table></div>";
		System.out.println("\n\n\n\n\n" + s);
		
		/// PREDICT
		
		int[][] allianceMembers = {
		/* 1 */	{33, 1718, 247},
		/* 2 */	{2619, 3302, 245},
		/* 3 */	{573, 3098, 1684},
		/* 4 */	{2145, 2612, 3620},
		/* 5 */	{51, 4810, 703},
		/* 6 */	{4382, 4405, 1504},
		/* 7 */	{3322, 1025, 548},
		/* 8 */	{3570, 3535, 3667}
		};
		
		double[] allianceValues = new double[allianceMembers.length];
		for(int i = 0; i < allianceMembers.length; i++){
			for(int j = 0; j < 3; j++){
				allianceValues[i] += totalEC.get(teamHash.get(allianceMembers[i][j]) - 1, 0);
			}
		}
		
		System.out.println(Arrays.toString(allianceValues));
	}

	
	//// HTML PARSING ---------------------------------------------------------
	
	
}
