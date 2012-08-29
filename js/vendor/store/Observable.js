define(["lang", "./lib/promise", "knockout" /*=====, "./api/Store" =====*/
], function(lang, Deferred, ko /*=====, Store =====*/){

// module:
//		store/Observable
// summary:
//		TODOC

function before(originalFn, beforeFn, ctx) {
	return function(){
		beforeFn.apply(ctx||this, arguments);
		return originalFn.apply(ctx||this, arguments);
	};
}

var Observable = function(/*Store*/ store){
	// summary:
	//		The Observable store wrapper takes a store and sets an observe method on query()
	//		results that can be used to monitor results for changes.
	//
	// description:
	//		Observable wraps an existing store so that notifications can be made when a query
	//		is performed.
	//
	// example:
	//		Create a Memory store that returns an observable query, and then log some
	//		information about that query.
	//
	//	| var store = store.Observable(new store.Memory({
	//	|		data: [
	//	|			{id: 1, name: "one", prime: false},
	//	|			{id: 2, name: "two", even: true, prime: true},
	//	|			{id: 3, name: "three", prime: true},
	//	|			{id: 4, name: "four", even: true, prime: false},
	//	|			{id: 5, name: "five", prime: true}
	//	|		]
	//	| }));
	//	| var changes = [], results = store.query({ prime: true });
	//	| var observer = results.observe(function(object, previousIndex, newIndex){
	//	|		changes.push({previousIndex:previousIndex, newIndex:newIndex, object:object});
	//	| });
	//
	//		See the Observable tests for more information.

	var undef, queryUpdaters = [], revision = 0;
	// a Comet driven store could directly call notify to notify observers when data has
	// changed on the backend
	// create a new instance
	store = Object.create(store);
	
	store.notify = function(object, existingId){
		// called when a change has been completed against the given object
		// 'remove' calls will only define existingId
		revision++;
		var updaters = queryUpdaters.slice();
		for(var i = 0, l = updaters.length; i < l; i++){
			updaters[i](object, existingId);
		}
	};
	var originalQuery = store.query;
	store.query = function(query, options){
		options = options || {};
		console.log("initial query options: ", options);
		var results = originalQuery.apply(this, arguments);
		// our return value - a knockout-js Observable
		var observedResults = ko.observableArray(results), 
		    originalSubscribe = observedResults.subscribe;
		  
		var registerNotifyListener;
		
		if(results && results.forEach){
			// TODO: reinstate the queryUpdates functionality, 
			// which allows subscribers to relevant queries to be notified when a store change 
			// implies a change in the results for a query
			
			var nonPagedOptions = lang.extend({}, options);
			delete nonPagedOptions.start;
			delete nonPagedOptions.count;
			
			// we remove the result range params when re-evaluating the query
			var queryExecutor = store.queryEngine && store.queryEngine(query, nonPagedOptions);
			var queryRevision = revision;
			var listeners = [], queryUpdater;
			var updateDetails = {};
			
			observedResults.subscribe = function(callback, callbackTarget, event, includeObjectUpdates){
				// Knockout's observables use a subscribe method to register a callback for any changes to the results
				//  that callback expects the new value(s) as its first argumen
			
				// on the *first call only* , hook up our listener for notifications of changes in the store
				// we need to make the changes to the observableArray once, and knockout will publish to all subscribers
				if(listeners.length <= 0) {
					// we can get notified of changes to a result item as well as the resultset 
					includeObjectUpdates = includeObjectUpdates || callback.includeObjectUpdates; 

					var listener = function(object, previousIndex, newIndex, resultsArray){
						updateDetails.object = object; 
						updateDetails.previousIndex = previousIndex; 
						updateDetails.newIndex = newIndex;

						// TODO: can use the previousIndex/newIndex to optimize this: maybe we can just push/pop or splice a single item
						if(options.start || options.count) {
							console.log("query options: ", options);
						}
						// the range of the results we need to end up with: 
						var rangeStart = options.start || 0, 
								rangeEnd = options.count || resultsArray.length;
						
								// the range of the existing array we need to update
						var spliceStart = 0, 
								spliceEnd = Math.max(observedResults().length, resultsArray.length);
						
						console.log("Splicing from: %s to %s", spliceStart, spliceEnd, resultsArray.length, resultsArray.slice(rangeStart, rangeEnd));
						observedResults.splice.apply(observedResults, [spliceStart, spliceEnd].concat(resultsArray.slice(rangeStart, rangeEnd)));
					};
					listeners.push(listener);
					
					// first listener was added, create the query checker and updater
					queryUpdaters.push(queryUpdater = function(changed, existingId){
						Deferred.when(results, function(resultsArray){
							console.log("queryUpdater: ", changed, existingId);
							var atEnd = resultsArray.length != options.count;
							var i, l, listener;
							if(++queryRevision != revision){
								throw new Error("Query is out of date, you must observe() the query prior to any data modifications");
							}
							var removedObject, removedFrom = -1, insertedInto = -1;
							if(existingId !== undef){
								// remove the old one
								for(i = 0, l = resultsArray.length; i < l; i++){
									var object = resultsArray[i];
									if(store.getIdentity(object) == existingId){
										removedObject = object;
										removedFrom = i;
										if(queryExecutor || !changed){// if it was changed and we don't have a queryExecutor, we shouldn't remove it because updated objects would be eliminated
											resultsArray.splice(i, 1);
										}
										break;
									}
								}
							}
							if(queryExecutor){
								// add the new one
								if(changed &&
										// if a matches function exists, use that (probably more efficient)
										(queryExecutor.matches ? queryExecutor.matches(changed) : queryExecutor([changed]).length)){

									var firstInsertedInto = removedFrom > -1 ? 
										removedFrom : // put back in the original slot so it doesn't move unless it needs to (relying on a stable sort below)
										resultsArray.length;
									resultsArray.splice(firstInsertedInto, 0, changed); // add the new item
									insertedInto = queryExecutor(resultsArray).indexOf(changed); // sort it
									// we now need to push the chagne back into the original results array
									resultsArray.splice(firstInsertedInto, 1); // remove the inserted item from the previous index
									
									if((options.start && insertedInto == 0) ||
										(!atEnd && insertedInto == resultsArray.length)){
										// if it is at the end of the page, assume it goes into the prev or next page
										insertedInto = -1;
									}else{
										resultsArray.splice(insertedInto, 0, changed); // and insert into the results array with the correct index
									}
								}
							}else if(changed && !options.start){
								// we don't have a queryEngine, so we can't provide any information
								// about where it was inserted, but we can at least indicate a new object
								insertedInto = removedFrom >= 0 ? removedFrom : (store.defaultIndex || 0);
							}
							if((removedFrom > -1 || insertedInto > -1) &&
									(includeObjectUpdates || !queryExecutor || (removedFrom != insertedInto))){
								var copyListeners = listeners.slice();
								for(i = 0;listener = copyListeners[i]; i++){
									listener(changed || removedObject, removedFrom, insertedInto, resultsArray);
								}
							}
						});
					});
					// end notification listener
				}
				
				// wrap the callback to also pass in the update details to any subcriber to this observable
				callback = lang.wrap(callback, function(callback, resultsArray){
					console.log("subscriber callback, updateDetails: ", updateDetails);
					return callback.call(this, resultsArray, updateDetails);
				});
				
				// ko's subscribable gives back a subscription handle object, with a dispose method
				// hook into that to do our own cleanup
				var subscription = originalSubscribe.call(this, callback, callbackTarget, event);
				
				subscription.dispose = before(subscription.dispose, function(){
					// remove this listener
					var index = listeners.indexOf(listener);
					if(index > -1){ // check to make sure we haven't already called cancel
						listeners.splice(index, 1);
						if(!listeners.length){
							// no more listeners, remove the query updater too
							queryUpdaters.splice(queryUpdaters.indexOf(queryUpdater), 1);
						}
					}
				});
				
				return subscription;
			};
		}
		Deferred.when(results, function(resultsArray){
			// put results in there and hook up subscribers when we have them
			observedResults.splice.apply(observedResults, [0, Math.max(observedResults().length, resultsArray.length)].concat(resultsArray));
		});
		console.log("Returning observableArray as results:", observedResults);
		return observedResults;
	};
	var inMethod;
	function whenFinished(method, action){
		var original = store[method];
		if(original){
			store[method] = function(value){
				if(inMethod){
					// if one method calls another (like add() calling put()) we don't want two events
					return original.apply(this, arguments);
				}
				inMethod = true;
				try{
					var results = original.apply(this, arguments);
					Deferred.when(results, function(results){
						action((typeof results == "object" && results) || value);
					});
					return results;
				}finally{
					inMethod = false;
				}
			};
		}
	}
	// monitor for updates by listening to these methods
	whenFinished("put", function(object){
		store.notify(object, store.getIdentity(object));
	});
	whenFinished("add", function(object){
		store.notify(object);
	});
	whenFinished("remove", function(id){
		store.notify(undefined, id);
	});

	return store;
};

return Observable;
});
