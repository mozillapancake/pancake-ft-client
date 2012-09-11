define(['compose', 'knockout', 'services/settings', 'lib/signin'], function(Compose, ko, settings, signin){

  // expose some objects as globals for easier debug
  window.settings = settings; 
  window.signin = signin; 


  var Page = Compose(Compose, {
    initialize: function(options){
      
      return this;
    },
    applyBindings: function(viewModel){
      var selfNode = $(this.el)[0];
      ko.applyBindings(viewModel || this, selfNode);
      return this;
    },
    setStore: function(store){
      var self = this;
      store = this.store = store;
      return this;
    },
    login: function(){
      // we have a session, so log out
      settings.username('guest');
      settings.session('');
    },
    logout: function(){
      // verify the username first, 
      // then get a session token from our api
      var viewModel = this.viewModel;
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
    // handler for login error/failure
    loginFailure: function(msg){
      console.log("Login failure: ", msg);
      settings.session('');
      this.viewModel.errorMessage(msg.message || msg);
    }
  });

  // ------------------
  // shared page viewModel prototype
  Page.ViewModel = {
    
    // page-level error message property
    errorMessage: ko.observable(''),

    loginLabel: ko.computed(function(){
      return settings.session() ? 'Logout' : 'Login';
    }),
    // event handler for login/out buttons
    login: function(){
      // toggle for logged-in-ness
      if(settings.session()){
        this.parent.logout();
      } else {
        this.parent.logout();
      }
    }
  };

  // helpers for viewmodel
  Page.ViewModel.thumbnail = function thumbnail(key) {
    console.log("building thumnail url for ", key);
    return settings.thumbnailUrl().replace('{thumbnail_key}', key);
  }

  
  return Page;
});