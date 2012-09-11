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
    settings: settings,
    errorMessage: ko.observable(''),
    // ------------------
    // candidates for shared page viewModel prototype
    loginFailure: function(msg){
      console.log("Login failure: ", msg);
      settings.session('');
      viewModel.errorMessage(msg.message || msg);
    },
    login: function(){
      // verify the username first, 
      // then get a session token from our api
      var verifiedUsername = '';
      signin.verify().then(function(resp){
        verifiedUsername = resp.username;
      }).then(function(){
        if(!verifiedUsername) return;
        
        signin.session().then(function(userSession){
          // only update the username property when its confirmed
          settings.username(userSession.username);
          // setting the session property should cascade a series of events
          // as it invalidates any resultsets
          settings.session(userSession.csrf_token);
        }, function(xhr, status, err){
          var msg = err || xhr.responseText;
          viewModel.loginFailure(msg);
        });
      });
    },
    //
    // ------------------
    
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