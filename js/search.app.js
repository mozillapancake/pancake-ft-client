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

  window.services = services; 

  // page has a lifecycle: initialize, applyBindings
  var app = window.app = Compose.create(Page, {
    el: 'body'
  });

  var thumbnail = Page.ViewModel.thumbnail;
  
  var viewModel = app.viewModel = Compose.create(Page.ViewModel, {
    parent: app, // give the viewModel a reference to its owner
    
    latestSearch:   ko.observable(''),

    // savedSearches:  services.search.savedSearches(),
    topRated:    ko.observableArray([]).extend({
      wireTo: services.search.topRated,
      composeWith: [function(values){
        return values.map(function(entry){
          entry.imgUrl = entry.thumbnail_key ? thumbnail(entry.thumbnail_key) : '';
          // console.log("Composing viewModel entry: ", entry, entry.imgUrl);
          return entry;
        });
      }]
    })
    // theirResults:   services.search.theirResults(),
    // webResults:     services.search.webResults(),
  });
  
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
  });
  app.applyBindings(viewModel);
  
});