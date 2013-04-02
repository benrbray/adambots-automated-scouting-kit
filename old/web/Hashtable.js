/**
 * HASHTABLE.JS
 * Hashtable object that mimicks the functionality of a Java Hashtable.
 * Note:  This is simply a JavaScript array with some added methods.
 */

//// CONSTRUCTOR --------------------------------------------------------------

function Hashtable(){
	var hash = {type:"Hashtable", count:0};
	
	hash.get = function(key) { return hash[key]; };
	
	hash.put = function(key, value) {
		hash[key] = value;
		hash.count++;
	};
	
	hash.remove = function(key){
		hash[key] = undefined;
		hash.count--;
	}
	
	hash.size = function() { return hash.count; };
	
	return hash;
}

function HashtableTypeCheck(hash){
	if(!hash.type || !hash.type == "Table"){
		throw "Hashtable :: Illegal Argument : hash (" + hash.type + ") is not of type 'Hashtable'";
	}
}