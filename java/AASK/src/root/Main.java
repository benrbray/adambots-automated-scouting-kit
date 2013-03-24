package root;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Hashtable;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import utils.ColorUtils;

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

	public String truncate(double u, int a){
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
		
		for (int i = 0; i < autonEC.getRowDimension(); i++)
		{
			s = s + "<tr>";
			s = s + "<td style=\"border-right:2px solid #BBBBBB; border-bottom:1px solid #CCCCCC; background:"  + "#EEEEEE" + "\">" + (int)teamStandings.getBody()[1][i] + "</td>";
			s = s + "<td style=\"background:" + ColorUtils.colorToHexString(ColorUtils.getRedGreen(1, i+1, autonEC.getRowDimension(), true))+ "\">" + (i+1) + "</td>";
			s = s + "<td style=\"background:" + ColorUtils.colorToHexString(ColorUtils.getRedGreen(autonr[0],autonEC.get(i,0),autonr[1])) + "\">" + truncate(autonEC.get(i,0),2) + "</td>";
			s = s + "<td style=\"background:" + ColorUtils.colorToHexString(ColorUtils.getRedGreen(climbr[0],climbEC.get(i,0),climbr[1])) + "\">" + truncate(climbEC.get(i,0),2) + "</td>";
			s = s + "<td style=\"background:" + ColorUtils.colorToHexString(ColorUtils.getRedGreen(teleopr[0],teleopEC.get(i,0),teleopr[1])) + "\">" + truncate(teleopEC.get(i,0),2) + "</td>";
			s = s + "<td style=\"background:" + ColorUtils.colorToHexString(ColorUtils.getRedGreen(totalr[0],totalEC.get(i,0),totalr[1])) + "\">" + truncate(totalEC.get(i,0),2) + "</td>";
			s = s + "</tr>";
		}
		s = s + "</tbody></table></div>";
		
		// Write to File
		BufferedWriter br;
		try {
			br = new BufferedWriter(new FileWriter("data.html"));
			br.write(s);
			br.close();
			java.awt.Desktop.getDesktop().browse(new URI("data.html"));
		} catch (IOException e) {
			e.printStackTrace();
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	
	//// HTML PARSING ---------------------------------------------------------
	
	
}
