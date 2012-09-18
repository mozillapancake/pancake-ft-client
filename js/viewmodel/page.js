define(['knockout', 'services/settings'], function(ko, settings){
  // Mixin/prototype for shared, page-level viewModel
  var viewModel = {
    
    // page-level error message property
    errorMessage: ko.observable(''),

    loginLabel: ko.computed(function(){
      return settings.session() ? 'Logout' : 'Login';
    }),
    // event handler for login/out buttons
    login: function(){
      // toggle for logged-in-ness
      if(!this.parent) return;
      
      if(settings.session()){
        this.parent.logout();
      } else {
        this.parent.logout();
      }
    }
  };

  // helpers for viewmodel
  viewModel.thumbnail = function thumbnail(key) {
    return settings.thumbnailUrl().replace('{thumbnail_key}', key);
  };

  return viewModel;
});