define([
  'dollar', 
  'knockout', 
  'compose', 
  'lib/page', 
  'services/settings', 
  'services/search', 
  'lib/knockout.composeWith'
], function($, ko, Compose, Page, settings, services){
  console.log("search.app loaded");

  // various views, aggregated onto one page
  var app = window.app = Compose.create(Page, {
    el: 'body'
  });
  // page has a lifecycle: initialize, assign store, applyBindings
  
  window.services = services; 
  window.settings = settings; 
  
  function thumbnail(key) {
    return function(){
      console.log("building thumnail url for ", key);
      return settings.thumbnailUrl().replace('{thumbnail_key}', key);
    };
  }
  var viewModel = app.viewModel = {
    latestSearch:   ko.observable(''),
    // savedSearches:  services.search.savedSearches(),
    topRated:    services.search.topRated().extend({ 
      composeWith: [
      // compose object with: 
      // title => stack.title
      // imgUrl => thumbnail(matches[0].thumbnailKey)
        // logger('name field'), 
        function(values) {
          return values.map(function(entry){
            console.log("composing stack viewModel: ", entry);
            return {
              title: entry.stack.title,
              imgUrl: ko.computed(thumbnail(entry.matches[0].thumbnail_key))
            };
          });
        }
      ] 
    }),
    
    // theirResults:   services.search.theirResults(),
    // webResults:     services.search.webResults(),
    username:       settings.username
  };
  
  
  
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
  });
  app.applyBindings(viewModel);
  
});