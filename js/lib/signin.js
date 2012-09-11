/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'dollar',
  'lang',
  'promise', 
  'verifiedemail'
], function($, lang, Promise, verifiedEmail ){

  var logger = {}; logger.log = logger.warn = logger.error = function(){};
  
  // TODO: Add evented mixin
  var signin = {
    verifyAssertion: function(defd, assertion) {
      var onSuccess = function(data){
        logger.log("signin, verify success");
        // browserid success response
        if (data.success) {
          defd.resolve(data);
        } else {
          logger.warn("browserid failure: ", data);
          defd.reject(data);
          //alert("BrowserID Verification Fail");
        }
      }; 
      var onFailure = function(xhr, status, error) {
        logger.log("signin, verify error");
        defd.reject('error', error);
        alert("Login error : " + status);
      };
      
      if (assertion) {
        $.ajax({
          url: settings.applicationRoot() + "browserid/verify",
          data: { 'assertion': assertion },
          dataType: "json"
        }).then(onSuccess, onFailure);
      } else {
        // missing assertion
        setTimeout(function(){
          defd.reject("Signin cancelled");
        }, 25);
      }
      return defd.promise;
    },
    verify: function(){
      // we'll give back a promised authorization result
      var defd = Promise.defer();
      // wrap the verifyAssertion callback so we can pass it our deferred
      var callback = lang.wrap(signin.verifyAssertion, function(handler, assertion){
        return handler.call(null, defd, assertion);
      });
      verifiedEmail.fetch(callback);
      return defd.promise;
    },
    session: function(username) {
      return $.ajax({
        url: settings.applicationRoot() + "api/session",
        dataType: "json"
      });
    }
  };

  return signin;
});
