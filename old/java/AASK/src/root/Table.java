package root;

import java.util.Hashtable;

public class Table {
	//// PRIVATE VARIABLES ----------------------------------------------------
	
	private String _url;
	private String _table;
	private String[] _heading;
	private double[][] _body;
	
	//// CONSTRUCTOR ----------------------------------------------------------
	
	public Table(){
		
	}
	
	public Table(String url){
		this(url, true);
	}
	
	public Table(String url, boolean extractNow){
		if(extractNow){
			extract(url);
		} else {
			_url = url;
		}
	}
	
	//// TABLE EXTRACTION -----------------------------------------------------
	
	public void extract(String url){
		_url = url;
		extract();
	}

	public void extract(){
		getBody();
	}
	
	//// PARSING METHODS ------------------------------------------------------
	
	public String getTable() {
		if (_table != null) { return _table; }
		
		String page = WebsiteReader.readURL(_url);
		String reltab = page.substring(page.indexOf("<table style=\"ba") + 1, page.length() - 1);
		reltab = reltab.substring(reltab.indexOf("<table style=\"ba"), reltab.length() - 1);
		reltab = reltab.substring(0, reltab.indexOf("</table") - 1);
		_table = reltab;
		
		return reltab;
	}

	public String[] getHeading() {
		if(_heading != null) { return _heading; }
		getTable();
		
		String heading = _table.substring(0, _table.indexOf("font-family:arial"));
		String[] head = heading.substring(heading.indexOf("MsNormal") + 5, heading.length() - 1).split("MsoNormal");
		String[] mm = new String[head.length - 2];
		for (int i = 0; i < mm.length; i++) {
			mm[i] = head[i + 1];
			mm[i] = mm[i].substring(mm[i].indexOf("white;") + 8, mm[i].indexOf("<o:p"));
		}
		_heading = mm;
		
		return mm;
	}

	public double[][] getBody() {
		if(_body != null){ return _body; }
		getHeading();
		
		String body = _table.substring(_table.indexOf("font-family:arial"), _table.length() - 1);
		String[] cell = body.split("\n");
		String[] cells = new String[cell.length];
		
		int o = 0;
		for (int i = 0; i < cell.length; i++) {
			if (cell[i].length() > 20 && cell[i].indexOf("</") > 0) {
				cells[o] = cell[i].substring(cell[i].indexOf(">") + 1, cell[i].indexOf("</"));
				o++;
			}
		}
		
		double[][] k = new double[_heading.length][o / _heading.length];
		for (int i = 0; i < o; i++) {
			try {
				k[i % _heading.length][i / _heading.length] = Double.parseDouble(cells[i]);
			} catch (Exception e) {
			}
		}
		_body = k;
		
		return k;
	}
	
	//// HASHTABLES -----------------------------------------------------------
	
	/**
	 * Construct a Hashtable using two columns of this table as (Key, Value) pairs.
	 * @param keyColumnIndex
	 * @param valueColumnIndex
	 * @return A Hashtable.
	 */
	public Hashtable<Integer, Integer> constructColumnHash(int keyColumnIndex, int valueColumnIndex){
		Hashtable<Integer, Integer> hash = new Hashtable<Integer, Integer>();
		
		for(int i = 0; i < _body[0].length; i++){
			hash.put((int)_body[keyColumnIndex][i], (int)_body[valueColumnIndex][i]);
		}
		
		return hash;
	}
	
	/**
	 * Construct a Hashtable using two rows of this table as (Key, Value) pairs.
	 * @param keyRowIndex
	 * @param valueRowIndex
	 * @return A Hashtable.
	 */
	public Hashtable<Integer, Integer> constructRowHash(int keyRowIndex, int valueRowIndex){
		Hashtable<Integer, Integer> hash = new Hashtable<Integer, Integer>();
		
		for(int i = 0; i < _body[0].length; i++){
			hash.put((int)_body[i][keyRowIndex], (int)_body[i][valueRowIndex]);
		}
		
		return hash;
	}
	
	//// GETTER / SETTER ------------------------------------------------------
	
	public int getRows(){
		return _body[0].length;
	}
	
	public int getColumns(){
		return _body.length;
	}
}
