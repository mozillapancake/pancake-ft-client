define(['compose', 'knockout', 'path', 'services/settings', 'services/signin', 'viewmodel/page'], function(Compose, ko, Path, settings, signin, pageViewModel){

  // expose some objects as globals for easier debug
  window.settings = settings; 
  window.signin = signin; 

  var Page = Compose(Compose, {
    initialize: function(options){
      
      return this;
    },
    router: Path,
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
    logout: function(){
      // we have a session, so log out
      settings.username('guest');
      settings.session(0);
    },
    login: function(){
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
      settings.session(0);
      this.viewModel.errorMessage(msg.message || msg);
    }
  });

  // ------------------
  // shared page viewModel prototype
  Page.ViewModel = pageViewModel;
  
  return Page;
});