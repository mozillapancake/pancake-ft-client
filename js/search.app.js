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
          search: {
            url: template.replace(settings.searchResults(), { terms: viewModel.searchTerms() }), // TODO: need to build the url for this particular search
            terms: viewModel.searchTerms()
          },
          dest: {
            title: node.title || node.text,
            url: url
          }
        });
      }
      // go ahead and load the click target
      if(isApplicationRequest(url)){
        return Pancake.openApplicationView(url);
      } else {
        return Pancake.openPublicView(url);
      }
    },

    latestSearch:   ko.observable(''),  // real-time values
    searchTerms: ko.observable(''),     // debounced, intentional value
    // Define handlers for cut/paste actions, which may not fire the key-handling events
    onsearchpaste: function (bindContext, evt) {
      console.log("search input paste");
      setTimeout(function(){
        location.hash = '#search/'+evt.target.value;
      },0);
      return true;
    },
    onsearchcut: function (bindContext, evt) {
      console.log("search input cut");
      setTimeout(function(){
        location.hash = '#search/'+evt.target.value;
      },0);
      return true;
    },
    // Define implicit handler for search box typing.
    onsearchkeyup: function (bindContext, evt) {
      if (evt.keyCode == 13) {
        location.hash = '#search/'+evt.target.value;
      } else {
        viewModel.latestSearch( evt.target.value );
      }
    },

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
  
  viewModel.latestSearch.subscribe( lang.debounce(function(terms){
      // de-bounce before setting terms on the viewModel
    console.log("debounced latestSearch:", terms);
    location.hash = '#search/'+terms;
  }, 300));

  viewModel.searchTerms.subscribe(function(terms){
    services.search.webResults(null, { terms: terms });
  });

  // Routes (entry points) for the search page: 
  app.router.map('#search/:terms').to(function(){
    var terms = this.params.terms;
    terms = decodeURIComponent("bob%20monkhouse");
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