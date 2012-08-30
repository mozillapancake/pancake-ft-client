define(['dollar', 'knockout', 'compose', 'lib/page', 'services/search', 'services/user', 'lib/knockout.composeWith'], function($, ko, Compose, Page, services){
  console.log("search.app loaded");

  // various views, aggregated onto one page
  var app = Compose.create(Page, {
    el: 'body'
  });
  // page has a lifecycle: initialize, assign store, applyBindings
  
  window.services = services; 
  
  var user = services.user();
  console.log("search.app, user is observable? ", ko.isObservable(user));
  console.log("search.app, user has value ", user());
  var viewModel = {
    latestSearch: ko.observable(''),
    savedSearches: services.search.savedSearches(),
    yourResults:    services.search.yourResults(),
    theirResults:   services.search.theirResults(),
    webResults:     services.search.webResults(),
    username: user.extend({ 
      composeWith: [function(values){ 
        console.log("username composeWith got: ", values);
        return values.shift ? values.shift().username : values.username; 
      }]
    })
  };
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
  });
  app.applyBindings(viewModel);
  
});