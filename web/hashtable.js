/*
This file is part of the Adambots Automated Scouting Kit (AASK).

AASK is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

AASK is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
AASK.  If not, see <http://www.gnu.org/licenses/>.

AASK was started during the 2013 FIRST season by Ben Bray and Curtis Fenner of
Team 245, the Adambots, for use by other FRC teams.
*/

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