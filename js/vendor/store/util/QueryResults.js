define(["../lib/util", "promise"
], function(lang, Promise){

//  module:
//    store/util/QueryResults
//  summary:
//    The module defines a query results wrapper

var QueryResults = function(results){
	// summary:
	//		A function that wraps the results of a store query with additional
	//		methods.
	//
	// description:
	//		QueryResults is a basic wrapper that allows for array-like iteration
	//		over any kind of returned data from a query.  While the simplest store
	//		will return a plain array of data, other stores may return deferreds or
	//		promises; this wrapper makes sure that *all* results can be treated
	//		the same.
	//
	//		Additional methods include `forEach`, `filter` and `map`.
	//
	// returns: Object
	//		An array-like object that can be used for iterating over.
	//
	// example:
	//		Query a store and iterate over the results.
	//
	//	|	store.query({ prime: true }).forEach(function(item){
	//	|		//	do something
	//	|	});

	if(!results){
		return results;
	}
	// if it is a promise it may be frozen
	if(results.then){
		results = (function(obj){
		  var nobj = Object.create(results);
		  for(var i in obj){
		    nobj[i] = obj[i];
		  }
		  return nobj;
		})(results);
	}
	function addIterativeMethod(method){
	  var array = Array.prototype;
		if(!results[method]){
			results[method] = function(){
				var args = arguments;
				return Promise.when(results, function(results){
					return QueryResults(array[method].apply(results, args));
				});
			};
		}
	}
	addIterativeMethod("forEach");
	addIterativeMethod("filter");
	addIterativeMethod("map");
	if(!results.total){
		results.total = Promise.when(results, function(results){
			return results.length;
		});
	}
	return results;
};

return QueryResults;

});
