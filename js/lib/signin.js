/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'dollar',
  'compose',
  'lib/events', 
  'verifiedemail'
], function($, Compose, Evented, verifiedEmail ){

  var logger = {}; logger.log = logger.warn = logger.error = function(){};
  
  // TODO: Add evented mixin
  var signin = Compose.create({
    verifyAssertion: function(assertion) {
      if (assertion) {
        $.ajax({
          url: "/browserid/verify",
          data: { 'assertion': assertion },
          dataType: "json",
          success: function(data, status, xhr) {
            logger.log("signin, verify success");
            // browserid success response
            if (data.success) {
              signin.trigger('verified', data);
            } else {
              logger.warn("browserid failure: ", data);
              signin.trigger('error', data);
              //alert("BrowserID Verification Fail");
            }
          },
          error: function(xhr, status, error) {
            logger.log("signin, verify error");
            signin.trigger('error', error);
            alert("Error login : " + status);
          }
        });
      } else {
        logger.error("Unknown BrowserID failure");
        signin.trigger('error', "Unknown BrowserID failure");
        // something went wrong! The user isn't logged in.
        // alert("BrowserID Failed. Not sure why.");
      } 
    },
    fetch: function(){
      verifiedEmail.fetch(signin.verifyAssertion);
    }
  }, Evented);

  return signin;
});
