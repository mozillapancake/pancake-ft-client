define([
  'dollar', 
  'knockout', 
  'compose', 
  'lib/page', 
  'services/settings', 
  'services/search', 
  // knockout extensions
  'lib/knockout.wireTo',
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
    topRated:    ko.observableArray([]).extend({
      wireTo: services.search.topRated,
      composeWith: [function(values){
        return values.map(function(entry){
          entry.imgUrl = '';
          return entry;
        });
      }]
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