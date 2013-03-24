package root;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Hashtable;


import Jama.Matrix;

public class Main {
    //// CONSTANTS ------------------------------------------------------------

    //// CONSTRUCTOR ----------------------------------------------------------
    public static void main(String[] args) {
        Main m = new Main();
    }

    public Main() {
        // Initialize
        init();
    }

    //// INITIALIZATION -------------------------------------------------------
    public void init() {
        // Parse Data
        MatchParser event = new MatchParser("http://www2.usfirst.org/2013comp/events/MIGBL/");

        // Get Data
        Hashtable<Integer, Integer> teamHash = event.getTeamHash();
        Table teamStandings = event.getTeamStandings();
        Jama.Matrix autonEC = event.getAutonContributions();
        Jama.Matrix climbEC = event.getClimbContributions();
        Jama.Matrix teleopEC = event.getTeleopContributions();
        Jama.Matrix totalEC = event.getTotalContributions();
        Jama.Matrix standings = event.getTeamStandingsMatrix();
        // Print Data
        System.out.println("Team\tAP\tCP\tTP\tTOTAL");
        for (int i = 0; i < autonEC.getRowDimension(); i++) {
            System.out.printf("%d\t%1.2f\t%1.2f\t%1.2f\t%1.2f\t\n",
                    (int) teamStandings.getBody()[1][i],
                    autonEC.get(i, 0),
                    climbEC.get(i, 0),
                    teleopEC.get(i, 0),
                    totalEC.get(i, 0));
        }

        String s = HTMLOutput.generateHTMLTable("Data from Grand Blanc Competition",
                new String[]{"Team", "Standing", "Autonomous", "Climb", "Teleop", "Total"},
                new Matrix[]{standings.getMatrix(0, standings.getRowDimension() - 1, 1, 1), standings, autonEC, climbEC, teleopEC, totalEC},
                new int[]{0, 1, 0, 0, 0, 0}, 1);

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
