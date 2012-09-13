define([
  'dollar', 
  'knockout', 
  'compose',
  'pancake', 
  'lib/page',
  'services/settings', 
  'services/search', 
  // knockout extensions
  'lib/knockout.wireTo',
  'lib/knockout.composeWith'
], function($, ko, Compose, Pancake, Page, settings, services){
  console.log("search.app loaded");

  window.services = services; 

  // page has a lifecycle: initialize, applyBindings
  var app = window.app = Compose.create(Page, {
    el: 'body'
  });

  var thumbnail = Page.ViewModel.thumbnail;

  document.addEventListener('click', function(evt){
    if(evt.altKey || evt.ctrlKey || evt.metaKey) {
      console.log("Passing alt/ctrl/meta click through: ", evt);
      return;
    }
    if(evt.which && evt.which === 3) {
      console.log("Passing right-click through: ", evt);
      return;
    }
    evt.preventDefault();
    var node = evt.target; 
    var url = node.getAttribute('data-target') || node.getAttribute('href'); 
    Pancake.openApplicationView(url);
  }, false);

  var viewModel = app.viewModel = Compose.create(Page.ViewModel, {
    parent: app, // give the viewModel a reference to its owner
    
    latestSearch:   ko.observable(''),

    // savedSearches:  services.search.savedSearches(),
    topRated:    ko.observableArray([]).extend({
      wireTo: services.search.topRated,
      composeWith: [function(values){
        return values.map(function(entry){
          entry.imgUrl = entry.thumbnail_key ? thumbnail(entry.thumbnail_key) : '';
          return entry;
        });
      }]
    }),
    webResults:    ko.observableArray([]).extend({
      wireTo: services.search.webResults
    })
  });
  
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
    services.search.webResults(null, { terms: terms });
  });
  app.applyBindings(viewModel);
  
});