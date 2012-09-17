define([
  'dollar', 
  'lang', 
  'compose', 
  'promise', 
  'services/core', 
  'services/settings',
  'knockout',
  'EventEmitter'
], function(
  $, 
  lang, 
  Compose,
  Promise, 
  services, 
  settings,
  ko,
  EventEmitter
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
        url: settings.latticeRoot() +'/'+ settings.username() + '/stack/top_rated'
      });
      
      $.ajax(options).then(function(resp){
        // top_rated gives us objects with: 
        // { matches: [], stack: {} }
        var timestamp = Date.now();

        // process the response, 
        //  deal out the parts of the response to the right tables in the store
        //  store updates should fire events at any affected listeners/resultsets
        var items = resp.map(function(item, i, ar){
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
            // console.log("top_rated result %s of %s", i, ar.length, item, item.thumbnail_key);
          }
          return item;
        });
        // TODO: just trigger a single change for the batch of results
        items.forEach(function(item){
          dataStore.put(item);
        });
        
      }, function(err){
        // send error to listeners
        stream.emitEvent('error', err);
      });

      return stream;
    },
    webResults: function(sink, options){
      options = options || {};
      // make a search, results are *not* put in the store just yet
      var results = [];

      // return an event emitter
      var stream = services.search.webResults.stream; 
      if(!stream) {
        stream = services.search.webResults.stream = new EventEmitter(); 
      }
      if(sink) {
        // attach one end to the provided sink
        stream.addListener('data', sink.ondata);
        // maybe implement:
        // steam.on('error', sink.onerror)
        // steam.on('pause', sink.onpause)
        // steam.on('resume', sink.resume)
      }
      // flush out existing results
      stream.emitEvent('data', [results, null]);
      var terms = options.terms; 
      if(terms) {
        delete options.terms;

        options = lang.defaults(options, {
          dataType: 'json',
          envelope: 'd',
          data: {
            format: 'json',
            q: terms || 'cheese',
            envelope: 'd'
          },
          url: settings.applicationRoot() + 'search/bing'
        });
        console.log("webResults request with options: ", options);
        $.ajax(options).then(function(resp){
          var timestamp = Date.now();

          // process the response, 
          //  decorate the result object with some meta data, and normalize property names
          results = resp.map(function(site, i, ar){
            // decorate object with a flag
            site.meta_type_site = true;
            site.meta_type_searchresult = true;
            site.types=['searchresult', 'site', 'web'];
            site.meta_response_time = timestamp;
            // normalize a bit
            site.title = site.place_title;
            site.url = site.place_url;
            delete site.place_title;
            delete site.place_url;
            // ensure the model object has an id of some kind
            if(!site.id) {
              site.id = i;
            }
            return site;
          });
          stream.emitEvent('data', [results, null]);
        }, function(err){
          // send error to listeners
          stream.emitEvent('error', err);
        });
      }
      
    }

  });
  

  return services;
});