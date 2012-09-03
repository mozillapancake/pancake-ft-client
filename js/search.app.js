define([
  'dollar', 'knockout', 'compose', 'lib/page', 'services/settings', 'services/search', 'services/user', 'lib/knockout.composeWith'
], function($, ko, Compose, Page, settings, services){
  console.log("search.app loaded");

  // various views, aggregated onto one page
  var app = Compose.create(Page, {
    el: 'body'
  });
  // page has a lifecycle: initialize, assign store, applyBindings
  
  window.services = services; 
  window.settings = settings; 
  
  var viewModel = {
    latestSearch:   ko.observable(''),
    savedSearches:  services.search.savedSearches(),
    yourResults:    services.search.yourResults(),
    theirResults:   services.search.theirResults(),
    webResults:     services.search.webResults(),
    username:       settings.value('username')
  };
  
  
  
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
  });
  app.applyBindings(viewModel);
  
});