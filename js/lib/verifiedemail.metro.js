/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['logger'], function(logger){
  return {
    fetch: function(){
      logger.log("verifiedemail.ios: fetch called, with origin: " + document.location.origin);
      //window.location = "browserid-origin://getVerifiedEmail/callback?data=" + document.location.origin;
      window.external.notify("browserid-origin://getVerifiedEmail/callback?data=" + document.location.origin);
    }
  };
});
