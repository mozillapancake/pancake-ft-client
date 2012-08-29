define([
  'dollar', 
  'underscore', 
  'vendor/compose', 
  'services/core', 
  'lib/signin', 
  'promise', 
  'knockout', 
  'vendor/knockout.mapping'
], function(
  $, 
  util,
  Compose, 
  services, 
  signin,
  Promise,
  ko,
  koMapping
){

  function successHandler(viewModel) {
    return function(resp){
      var data = ('string' == typeof resp) ? JSON.parse(resp) : resp;
      koMapping.fromJS(data, viewModel);
    };
  }
  
  var store = services; 
  var users = ko.observableArray([]); 
  // set up a live resultset that publishes updates to a knockout observable array
  Promise.when(store.query({ type: 'user' }), function(results){
    results.subscribe(function(){ 
      console.log("Updates to users results: ", arguments);
    });
  });
  
  var handleError = function(msg) {
    return function(err) {
      console.warn(msg, err);
    };
  };

  services.user = function(name, options) {
    options = options || {};
    // get the default username from settings
    name = name || services.get('setting/username').value;
    var user = options.user || ko.observable({ username: name }), 
        unwrappedUser = user();

    console.log("services.user, user is observable? ", ko.isObservable(user));
    console.log("services.user, user has value ", user());
    
    // as its observable, query returns a result immediately, which is later filled
    var results = store.query({ type: 'user', username: name });
    Promise.when(results, function(resultsArray){
      console.log("query callback, got results: ", results);
      // just update with the first match
      if(resultsArray[0]){
        user(resultsArray[0]); 
      } else {
        console.log("No results for query: ", { type: 'user', username: name });
      }
    });
    
    results.subscribe(util.extend(function(){
      console.log("change to username query: ", arguments);
      // console.log("change to users: ", user, insertedIdx, removedIdx);
    }, { includeObjectUpdates: true }));
    
    return user;
  };
  
  services.user.verify = function(){
    // verify the current user
  };
  services.user.signout = function(sucess, error){
    
  };
  
  services.user.signin = function(options){
    options = options || {};

    var user = services.user(options.username); // the observable object we've bound to???
    var success = options.success || function(){}, 
        error = options.error || function(){};
        
    function onVerified(data){
      // If the user is active then we enter the app. Otherwise we show the 'thank you' text.
      var userData = user();
      util.extend(userData, data);
      // update the observable with changes
      user(userData); 
      
      if (data.active) { 
        // If the user already went through the setup then we go straight to the app. Otherwise we go to setup.
        if ('agreed-to-privacy-policy' in data && data['agreed-to-privacy-policy'] === "true") {
          // trigger event to signal login success (web)
          console.log("signin: login success");
        } else {
          // known user needs to agree to policies
          console.log("signin: user needs to agree to policies");
        }
      } else {
        console.log("signin: account incomplete");
        // // no user/inactive user
        // // needs to create an 
        // console.log("signin: user needs to agree to policies");
        // $("#persona-signin").css("visibility", "hidden");
        // $("#thanks").css("visibility", "visible");                    
        // $("#intro-text").css("display", "none");
      }
    }
    function onVerificationError(err){
      console.log("Login error: " + (err ? err.message : err));
      user( util.extend(user(), {
        error: err.message || "Error"
      }) );
    }

    signin.bind('verified', onVerified); 
    signin.bind('error', onVerificationError);
    
    return signin.fetch();
  };
  
  return services.user;
});