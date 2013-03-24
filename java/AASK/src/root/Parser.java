package root;

import org.jsoup.nodes.Element;

public class Parser {
	//// CONSTANTS ------------------------------------------------------------
	
	//// TABLE EXTRACTION -----------------------------------------------------
	
	public static Element getImmediateParentTable(Element element) {
	    while(element.tagName().equals("table")) {
	        return element;
	    }
	    return getImmediateParentTable(element.parent());
	}
}
