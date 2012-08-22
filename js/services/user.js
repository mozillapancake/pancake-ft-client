define([
  'dollar', 
  'vendor/compose', 
  'services/core', 
  'lib/signin', 
  'promise', 
  'vendor/knockout', 
  'vendor/knockout.mapping'
], function(
  $, 
  Compose, 
  services, 
  signin,
  Promise,
  ko,
  koMapping
){

  var useProto = {
    username: "guest",
    verified: false
  };
  
  function successHandler(viewModel) {
    return function(resp){
      var data = ('string' == typeof resp) ? JSON.parse(resp) : resp;
      koMapping.fromJS(data, viewModel);
    };
  }
  
  services.user = Compose.create(services.user || {}, {
    get: function(name, options){
      options = options || {};
      var user = options.user || ko.observable({ username: '...' });
      
      Promise.when(services.get('user'), function(data){
        setTimeout(function(){ 
          console.log("Updating user");
          user(data);
        }, 2000);
      });
      
      // $.ajax({
      //   url: '/user/'+encodeURIComponent(name),
      //   cache: false,
      //   type: 'GET',
      //   success: successHandler(user),
      //   error: function(err){
      //     console.warn("Error fetching user details: ", err);
      //   }
      // });
      // 
      return user;
    }, 
    verify: function(){
      
    },
    signin: function(sucess, error){
      function onVerified(data){
        // If the user is active then we enter the app. Otherwise we show the 'thank you' text.
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
          // no user/inactive user
          // needs to create an 
          console.log("signin: user needs to agree to policies");
          $("#persona-signin").css("visibility", "hidden");
          $("#thanks").css("visibility", "visible");                    
          $("#intro-text").css("display", "none");
        }
      }
      function onVerificationError(err){
        alert("Login error: " + (err ? err.message : err));
      }
      signin.bind('verified', onVerified); 
      signin.bind('error', onVerificationError);
      
      return signin.fetch();
    }
  });
  
  return services;
});