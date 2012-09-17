define([
  'dollar', 
  'lang', 
  'lib/template', 
  'pancake', 
  'lib/url', 
  'services/core', 
  'services/settings', 
  'lib/middlewareAdapter',
  'lib/io/sessionTokenAdapter'
], function(
  $, 
  lang,
  template,
  Pancake,
  Url,
  services, 
  settings,
  adapt,
  sessionTokenAdapter
){

  var dataStore = services; // for clarity, the services/core *is* our front-end data store
  function onError(err) {
    console.warn("Error: ", err);
  }

  services.stack = lang.extend(services.stack || {}, {
    createStackFromSearch: function(query, options){
      options = options || {};
      // when we click on a search result, a new stack and session should be created
      options = lang.defaults(options, {
        contentType: 'application/json',
        url: template.replace(settings.latticeUrl(), { 
          username: settings.username(), 
          service: 'stack',
          method: 'search'
        }),
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify(lang.extend(query, {
          format: 'json',
          envelope: 'd'
        }), null, 2)
      });

      sessionTokenAdapter([ options ]);
      
      console.log("webResults request with options: ", options);
      $.ajax(options).then(function(resp){
        var timestamp = Date.now();
        console.log("New session response: ", resp);

        // update our local store with the sites/pages we get back
        var site = resp.place; 
        site.meta_type_site = true;
        site.meta_response_time = timestamp;
        dataStore.put(site);

        var resultPage = resp.search_place; 
        resultPage.meta_type_site = true;
        resultPage.meta_response_time = timestamp;
        resultPage.url = query.search_url;
        resultPage.title = query.search_terms;
        dataStore.put(resultPage);
        
        // update our local store with the stack
        var stack = resp.stack;
        stack.meta_type_stack = true;
        stack.meta_response_time = timestamp;
        dataStore.put(stack);
        
      }, onError);
      
    },
    createStackFromUrl: function(item){
      
    },
    addStackLink: function(item){
      
    },
    activeStacks: function(sink, options){
      options = options || {};
      // return an event emitter
      var stream = services.stack.activeStacks.stream; 
      if(!stream) {
        stream = services.stack.activeStacks.stream = services.createStream({
          meta_type_stack: true,
          meta_hassession: true
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
        url: settings.latticeRoot() +'/'+ settings.username() + '/session/active'
      });
      
      $.ajax(options).then(function(resp){
        // top_rated gives us objects with: 
        // { matches: [], stack: {} }
        var timestamp = Date.now();
        var storeItem;

        // process the response, 
        //  deal out the parts of the response to the right tables in the store
        //  store updates should fire events at any affected listeners/resultsets

        // TODO: just trigger a single change for the batch of results
        resp.forEach(function(item, i, ar){
          var thumbnail_key; 
          if(item.active_page){
            var site = item.active_page;
            // decorate object with a flag
            site.meta_type_site = true;
            site.meta_response_time = timestamp;
            if(!thumbnail_key && site.thumbnail_key) {
              // use the thumbnail_key from the first site for the stack
              thumbnail_key = site.thumbnail_key;
            }
            storeItem = dataStore.get(item.active_page.id);
            if(storeItem) {
              lang.extend(storeItem, site);
              dataStore.put(storeItem);
            } else {
              dataStore.add(site);
            }
            delete item.active_page;
          }
          var stack = {
            id: item.stack_id,
            title: item.stack_title,
            sub_type: item.stack_subtype,
            provider: item.stack_provider,
            page_count: item.page_count,
            session_id: item.session_id,
            meta_type_stack: true,
            meta_hassession: !!item.session_id,
            meta_response_time: timestamp,
            thumbnail_key: thumbnail_key
          };
          console.log("Adding active stack: ", stack);
          storeItem = dataStore.get(stack.id);
          if(storeItem) {
            lang.extend(storeItem, stack);
            dataStore.put(storeItem);
          } else {
            dataStore.add(stack);
          }
        });
        
      }, function(err){
        // send error to listeners
        stream.emitEvent('error', err);
      });

      return stream;
    },
    getNodesForStack: function(options){
      
    }
  });
  services.stack.activeStacks.nom = "services.stack.activeStacks";

  return services.stack;
});