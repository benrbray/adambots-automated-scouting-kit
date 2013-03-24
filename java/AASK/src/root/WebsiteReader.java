package root;

/**
*
* @author The Internet
*/
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;

public class WebsiteReader {

   private static InputStreamReader getURL(String url) throws IOException {
       return new InputStreamReader(new URL(url).openStream());
   }
   
   private static FileReader getFileReader(String path) throws IOException {
	   return new FileReader(new File(path));
   }

   public static String readURL(String url) {
       try {
    	   BufferedReader reader = new BufferedReader(getURL(url));
           String line = reader.readLine();
           String k = "";
           while (line != null) {
               k = k + line + "\n";
               line = reader.readLine();
           }
           return k;
       } catch (Exception e) {
       }
       return null;
   }
   
   public static String readPath(String path) {
       try {
    	   BufferedReader reader = new BufferedReader(getFileReader(path));
           String line = reader.readLine();
           String k = "";
           while (line != null) {
               k = k + line + "\n";
               line = reader.readLine();
           }
           return k;
       } catch (Exception e) {
       }
       return null;
   }
}
