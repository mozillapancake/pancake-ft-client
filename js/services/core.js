define([
  'lang', 
  'services/settings', 
  'store/Observable', 
  'store/Memory',
  'EventEmitter',
  'promise'
], function(
  lang, 
  settings, 
  Observable, 
  Memory,
  EventEmitter,
  Promise
){

  // local proxy for data stored and shared across the application
  // could be seeded from localStorage
  // maybe use Cache to have a front and server-backed store

  // -------------------
  // Init the store
  //
  var storeData = [];

  // var restStore = new JsonRest({
  //   target: '/pancake/'
  // });

  var cachingStore = new Memory({
    data: storeData
  });
  
  var observedStore = Observable( cachingStore );
  observedStore.dataStore = cachingStore;
  // observedStore.serverStore = restStore;

  observedStore.createStream = function createStream(query, options){
    var stream = new EventEmitter(); 
    var results = observedStore.query(query);
    
    // NB: q.js guarantees async using Promise.when - other implementations do not
    Promise.when(results, function(data){
      // Initial results came back for boards query
      stream.emitEvent('data', [data, null]);
    }, function(err){
      stream.emitEvent('error', [err]);
    });
    results.observe(function(data, fromIndex, toIndex){
      console.log("Observed match for query", query, data);
      // update resultset
      stream.emitEvent('data', [data, {
        fromIndex: fromIndex, 
        toIndex: toIndex
      }]);
    }, true);
    console.log("Created stream with query, options: ", query, options);
    return stream;
  };

  // not sure we need the restStore? 
  // use a simple service model with api.foo = function(){} // getter, returns promise
  // and api.foo.put = function(){} // getter, returns promise
  
  // each service adds itself to this module
  // this module can provide helpers and boilerplate for the API methods

  // io.ajax.before(function(args, resp, next){
  //   if(dataAdapters.requestAdapter.matcher(args[0])) {
  //     // console.log("Applying requestAdapter");
  //     dataAdapters.requestAdapter(args, resp, next);
  //   } else {
  //     next(args, resp);
  //   }
  // });
  // io.ajax.after(function(args, resp, next){
  //   if(dataAdapters.responseAdapter.matcher(args[0])) {
  //     dataAdapters.responseAdapter(args, resp, next);
  //   } else {
  //     next(args, resp);
  //   }
  // });
  // 

  return observedStore;
});