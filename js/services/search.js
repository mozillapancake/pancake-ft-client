define([
  'dollar', 
  'lang', 
  'compose', 
  'promise', 
  'services/core', 
  'services/settings',
  'knockout'
], function(
  $, 
  lang, 
  Compose,
  Promise, 
  services, 
  settings,
  ko
){

  function dataToViewModel(data){
    // util.defaults(data, proto);
    // FIXME: ko.mapping is not defined? 
    // var viewModel = ko.mapping.fromJS(data);
    var viewModel = data;
    return viewModel;
  }

  function successHandler(rows) {
    return function(results){
      if('string' == typeof results) {
        results = JSON.parse(results);
      }
      var len = ('function' == typeof rows) ? rows().length : rows.length;
      // rows is observable, so splice triggers updates in any bindings
      rows.splice.apply(
        rows, 
        [0, len].concat( results.map( dataToViewModel ) )
      );
    };
  }
  
  var dataStore = services; // for clarity, the services/core *is* our front-end data store
  function onError(err) {
    console.warn("Error: ", err);
  }
  
  settings.username.subscribe(function(newName){
    // username change, invalidates all/most of the records in our store
    // get the new stuff
    services.search.topRated(null, { refresh: true });
  });

  services.search = Compose.create(services.search || {}, {
    topRated: function(sink, options){
      options = options || {};

      // fashion a query for our store to get local results
      // TODO: and, if we have a connection or if reset: true, request new results from server
      
      // return an event emitter
      var stream = services.search.topRated.stream; 
      if(!stream) {
        stream = services.search.topRated.stream = services.createStream({
          meta_type_top_rated: true
        });
      }
      if(sink) {
        // attach one end to the provided sink
        stream.addListener('data', sink.ondata);
        // maybe implement:
        // steam.on('error', sink.onerror)
        // steam.on('pause', sink.onpause)
        // steam.on('resume', sink.resume)
      }
      if(options.refresh) {
        options.cache = false; 
        delete options.refresh;
      }
      // ...and attach the other end to the source
      // fetch results from the server and populate the store
      options = lang.defaults(options, {
        dataType: 'json',
        envelope: 'd',
        url: settings.applicationRoot() + settings.username() + '/stack/top_rated'
      });
      
      $.ajax(options).then(function(resp){
        // top_rated gives us objects with: 
        // { matches: [], stack: {} }
        var timestamp = Date.now();

        // process the response, 
        //  deal out the parts of the response to the right tables in the store
        //  store updates should fire events at any affected listeners/resultsets
        resp.forEach(function(item, i, ar){
          var thumbnail_key; 
          if(item.matches){
            item.matches.forEach(function(site, idx){
              // decorate object with a flag
              site.meta_type_site = true;
              site.meta_response_time = timestamp;
              dataStore.put(site);
              if(!thumbnail_key && site.thumbnail_key) {
                // use the thumbnail_key from the first site for the stack
                thumbnail_key = site.thumbnail_key;
              }
            });
          }
          if(item.stack) {
            item = item.stack;
            item.meta_type_top_rated = true;
            item.meta_response_time = timestamp;
            item.thumbnail_key = thumbnail_key || '';
            console.log("top_rated result %s of %s", i, ar.length, item, item.thumbnail_key);
            dataStore.put(item);
            console.log("/top_rated result");
          }
        });
      }, function(err){
        // send error to listeners
        stream.emitEvent('error', err);
      });

      return stream;
    }
  });
  
  return services;
});