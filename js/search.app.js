define([
  'dollar', 
  'knockout', 
  'compose', 
  'lib/page', 
  'lib/signin', 
  'services/settings', 
  'services/search', 
  // knockout extensions
  'lib/knockout.wireTo',
  'lib/knockout.composeWith'
], function($, ko, Compose, Page, signin, settings, services){
  console.log("search.app loaded");

  // various views, aggregated onto one page
  // page has a lifecycle: initialize, assign store, applyBindings
  var app = window.app = Compose.create(Page, {
    el: 'body'
  });

  // expose some objects as globals for easier debug
  window.services = services; 
  window.settings = settings; 
  window.signin = signin; 

  function thumbnail(key) {
    console.log("building thumnail url for ", key);
    return settings.thumbnailUrl().replace('{thumbnail_key}', key);
  }
  var viewModel = app.viewModel = {
    login: function(){
      console.log("TODO: actually login");
      signin.fetch().then(function(resp){
        settings.username(resp.username);
      });
    },
    latestSearch:   ko.observable(''),
    // savedSearches:  services.search.savedSearches(),
    topRated:    ko.observableArray([]).extend({
      wireTo: services.search.topRated,
      composeWith: [function(values){
        return values.map(function(entry){
          entry.imgUrl = entry.thumbnail_key ? thumbnail(entry.thumbnail_key) : '';
          console.log("Composing viewModel entry: ", entry, entry.imgUrl);
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