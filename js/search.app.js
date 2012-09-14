define([
  'dollar', 
  'knockout', 
  'compose',
  'pancake', 
  'lib/page',
  'lib/url',
  'services/settings', 
  'services/search', 
  'services/stack', 
  // knockout extensions
  'lib/knockout.wireTo',
  'lib/knockout.composeWith',
  'lib/knockout.classlist'
], function($, ko, Compose, Pancake, Page, Url, settings, services){
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
          itemNode = $(evt.target).closest('li')[0], 
          url = node.getAttribute('data-target') || node.getAttribute('href'); 

      console.log("click with ", bindingContext, evt);

      // TODO: refactor out somewhere nice
      var classList = itemNode.classList; 
      if(classList.contains('searchresult') && classList.contains('site')) {
        console.log("Web search result site clicked, send it off to services.stack.createStackFromSearch");
        services.stack.createStackFromSearch({ 
          search: {
            url: settings.searchResults(), // TODO: need to build the url for this particular search
            terms: viewModel.latestSearch()
          },
          dest: {
            title: node.title || node.text,
            url: url
          }
        });
      }
      // ---
      
      // to log the click, we need to know: 
      //  its id in the store
      if(isApplicationRequest(url)){
        return Pancake.openApplicationView(url);
      } else {
        return Pancake.openPublicView(url);
      }
    },

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
    }),
    login: function(){
      if(settings.session()) {
        app.logout();
      } else {
        app.login();
      }
    }
  });
  
  viewModel.latestSearch.subscribe(function(terms){
    console.log("latest search:", terms);
    services.search.webResults(null, { terms: terms });
  });
  
  
  app.applyBindings(viewModel);
  
});