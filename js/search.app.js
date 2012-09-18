define([
  'dollar', 
  'lang', 
  'knockout', 
  'compose',
  'pancake', 
  'lib/page',
  'lib/url',
  'lib/template',
  'services/settings', 
  'services/search', 
  'services/stack', 
  // knockout extensions
  'lib/knockout.wireTo',
  'lib/knockout.composeWith',
  'lib/knockout.classlist'
], function($, lang, ko, Compose, Pancake, Page, Url, template, settings, services){
  console.log("search.app loaded");

  window.services = services; 

  // page has a lifecycle: initialize, applyBindings
  var app = window.app = Compose.create(Page, {
    el: 'body'
  });

  var thumbnail = Page.ViewModel.thumbnail;

  // TODO: Belongs on Page or helper lib
  var urlcache = {};
  var isWebRequest = function(args, resp){
    var url = args[0];
    url = Url.parse(url);
    return (location.protocol+location.host !== url.scheme+':'+url.host);
  };
  var isApplicationRequest = function(args, resp){
    return !isWebRequest.apply(this, arguments);
  };

  // intercept link clicks and route them through the Pancake.* API methods

  var viewModel = app.viewModel = Compose.create(Page.ViewModel, {
    parent: app, // give the viewModel a reference to its owner
    
    resultClick: function(bindingContext, evt){
      if(evt.altKey || evt.ctrlKey || evt.metaKey) {
        console.log("Passing alt/ctrl/meta click through: ", evt);
        return;
      }
      if(evt.which && evt.which === 3) {
        console.log("Passing right-click through: ", evt);
        return;
      }
      evt.preventDefault();
      var node = evt.target, 
          itemNode = $(evt.target).closest('[data-itemid]')[0], 
          url = node.getAttribute('data-target') || node.getAttribute('href'); 

      // TODO: refactor out somewhere nice
      var classList = itemNode.classList; 
      if(classList.contains('searchresult') && classList.contains('site')) {
        console.log("Web search result site clicked, send it off to services.stack.createStackFromSearch");
        services.stack.createStackFromSearch({ 
          "search_url": template.replace(settings.searchResults(), { terms: viewModel.searchTerms() }),
          "search_terms": viewModel.searchTerms(),
          "place_url": url, 
          "place_title" : node.title || node.text
        });
      }
      // go ahead and load the click target
      if(isApplicationRequest(url)){
        return Pancake.openApplicationView(url);
      } else {
        return Pancake.openPublicView(url);
      }
    },

    searchTerms: ko.observable(''),     // debounced, intentional value

    // savedSearches:  services.search.savedSearches(),
    activeStacks:    ko.observableArray([]).extend({
      wireTo: services.stack.activeStacks,
      composeWith: [function(values){
        return values.map(function(entry){
          entry.imgUrl = entry.thumbnail_key ? thumbnail(entry.thumbnail_key) : '';
          return entry;
        });
      }]
    }),
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
    }),
    login: function(){
      if(settings.session()) {
        app.logout();
      } else {
        app.login();
      }
    }
  });
  
  viewModel.searchTerms.subscribe(function(terms){
    services.search.webResults(null, { terms: terms });
  });

  settings.session.subscribe(function(newName){
    // session/username change, invalidates all/most of the records in our store
    // get the new stuff
    services.search.topRated(null, { refresh: true });
    services.stack.activeStacks(null, { refresh: true });
  });


  // Routes (entry points) for the search page: 
  app.router.map('#search/:terms').to(function(){
    var terms = this.params.terms;
    terms = decodeURIComponent(terms);
    console.log("Search on terms: ", terms);
    app.viewModel.searchTerms(terms);
  });
  app.router.root('');
  app.router.rescue(function(){
    console.log("no route match");
  });  
  app.router.listen();
  
  app.applyBindings(viewModel);
  
});