/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package root;

import Jama.Matrix;
import utils.ColorUtils;

/**
 *
 * @author Blue
 */
public class HTMLOutput {

    public static String truncate(double u, int a) {
        String m = u + "";
        if (m.indexOf(".") == -1) {
            return m;
        }
        if ((double) ((int) u) == u) {
            return (int) u + "";
        }
        return m.substring(0, (int) Math.min(m.length() - 1, m.indexOf(".") + a + 1));
    }

    public static double getMinimum(Matrix u) {
        double a = u.get(0, 0);
        for (int i = 0; i < u.getRowDimension(); i++) {
            a = Math.min(a, u.get(i, 0));
        }
        return a;
    }

    public static double getMaximum(Matrix u) {
        double a = u.get(0, 0);
        for (int i = 0; i < u.getRowDimension(); i++) {
            a = Math.max(a, u.get(i, 0));
        }
        return a;
    }

    /**
     *
     * @param title The title of the table
     * @param heading The list of names of columns
     * @param cols The data to fill the columns with
     * @param colors Color schemes for the columns. 0--red/green inc. 1--r/g
     * dec. 2:red/blue inc. 3:red/blue dec
     * @param gray number of columns to make gray rather than gradient-y
     * @return
     */
    public static String generateHTMLTable(String title, String[] heading, Matrix[] cols, int[] colors, int gray) {

        String s;
        //
        s = "<!doctype html>\n<html>\n<head>\n<title>Adambots Automated Scouting Kit</title>\n";
        s = s + "<style>\n"
                + "body {\n"
                + "font-family:Arial;\n"
                + "font-size:12px;\n"
                + "}\n"
                + "#thetable * tr td {\n"
                + "border-right: 1px solid #555555;\n"
                + "border-bottom: 1px solid #555555;\n"
                + "}\n"
                + "table {\n"
                + "text-align:center;\n"
                + "border-left:1px solid #555555;\n"
                + "border-top:1px solid #555555;\n"
                + "}\n"
                + "thead {\n"
                + "font-weight:bold;\n"
                + "background:#EEEEEE;\n"
                + "}\n"
                + "tfoot {\n"
                + "text-align:left;\n"
                + "}\n"
                + "thead tr td {\n"
                + "width:80px;\n"
                + "padding-top:4px;\n"
                + "padding-bottom:4px;\n"
                + "padding-left:10px;\n"
                + "padding-right:10px;\n"
                + "}</style>\n";
        s = s + "</head><body>";
        //create the page stuff, now create the table:
        s = s + "<div style='border:1px solid #AAAAAA; width:600px; padding:1px;margin-left:auto;margin-right:auto;'>\n"
                + "<table id=\"thetable\" class=\"results\" cellspacing=\"0\"><thead>\n";
        s = s + "<tr><td style=\"width:9999px;\" colspan=\"" + heading.length + "\">" + title + "</td></tr>";

        s = s + "<tr>";
        for (int i = 0; i < heading.length; i++) {
            s = s + "<td>" + heading[i] + "</td>";
        }
        s = s + "</tr></thead>";
        //Heading stuff made, make the table body
        s = s + "<tbody id=\"thedata\">";
        for (int row = 0; row < cols[0].getRowDimension(); row++) {
            s = s + "<tr>";
            for (int col = 0; col < cols.length; col++) {
                if (col < gray) {
                    s = s + "<td style=\"background:#EEEEEE;\">" + truncate(cols[col].get(row, 0), 2) + "</td>";
                } else {
                    double min = getMinimum(cols[col]);
                    double max = getMaximum(cols[col]);
                    double val = cols[col].get(row, 0);
                    String color = "white";
                    if (colors[col] == 0) {
                        color = ColorUtils.colorToHexString(ColorUtils.getRedGreen(min, val, max));
                    }
                    if (colors[col] == 1) {
                        color = ColorUtils.colorToHexString(ColorUtils.getRedGreen(min, max - val, max));
                    }
                    if (colors[col] == 2) {
                        color = ColorUtils.colorToHexString(ColorUtils.getColdWarm(min, val, max));
                    }
                    if (colors[col] == 3) {
                        color = ColorUtils.colorToHexString(ColorUtils.getColdWarm(min, max - val, max));
                    }
                    s = s + "<td style=\"background:" + color + "\">" + truncate(cols[col].get(row, 0), 2) + "</td>";
                }
            }
            s = s + "</tr>";
        }
        return s;
    }
}
