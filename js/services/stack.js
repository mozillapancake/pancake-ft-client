define([
  'dollar', 
  'lang', 
  'lib/template', 
  'pancake', 
  'lib/url', 
  'services/core', 
  'services/settings', 
  'lib/middlewareAdapter'
], function(
  $, 
  lang,
  template,
  Pancake,
  Url,
  services, 
  settings,
  adapt
){

  var dataStore = services; // for clarity, the services/core *is* our front-end data store
  function onError(err) {
    console.warn("Error: ", err);
  }

  services.stack = lang.extend(services.search || {}, {
    createStackFromSearch: function(query, options){
      options = options || {};
      // when we click on a search result, a new stack and session should be created
      options = lang.defaults(options, {
        url: settings.applicationRoot() + 'search/bing',
        dataType: 'json',
        type: 'POST',
        data: lang.extend(query, {
          format: 'json',
          envelope: 'd'
        })
      });
      console.log("webResults request with options: ", options);
      console.log("TODO: POST data to url ", options);
    },
    createStackFromUrl: function(item){
      
    },
    addStackLink: function(item){
      
    },
    getActive: function(options){
      
    },
    getNodesForStack: function(options){
      
    }
  });

  return services.stack;
});