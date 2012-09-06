define([
  'dollar', 'knockout', 'compose', 'lib/page', 'services/settings', 'services/search', 'lib/knockout.composeWith'
], function($, ko, Compose, Page, settings, services){
  console.log("search.app loaded");

  // various views, aggregated onto one page
  var app = window.app = Compose.create(Page, {
    el: 'body'
  });
  // page has a lifecycle: initialize, assign store, applyBindings
  
  window.services = services; 
  window.settings = settings; 
  
  var viewModel = app.viewModel = {
    latestSearch:   ko.observable(''),
    // savedSearches:  services.search.savedSearches(),
    topRated:    services.search.topRated(),
    // theirResults:   services.search.theirResults(),
    // webResults:     services.search.webResults(),
    username:       settings.username
  };
  
  
  
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
  });
  app.applyBindings(viewModel);
  
});