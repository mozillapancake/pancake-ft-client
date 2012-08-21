/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function(){
  
  function noNetworkAdpater(req){
    this.callNext = true; // pass the request along the chain for the next handler
    var onerror = req.error;
    
    req.error = function onRequestError(xhr, status, err){
      var resp = xhr.responseText, 
          code = Number(xhr.status);
      if(
        code === 0    || 
        code === 502  ||
        code === 503
      ){
        // possibly-temporary unavailability
        noNetworkAdpater.setConnected(false, { status: code });
        // console.log("unreachableRequests adapter, got status code: ", code);
        this.callNext = false;
        return;
      }
      return onerror.apply(req, arguments);
    };
  }
  noNetworkAdpater.name = "noNetworkAdapter";
  noNetworkAdpater.matcher = function(req){
    // only handle urls on the same domain
    return req.url.indexOf( config ? config.applicationRoot : '/' ) === 0;
  };

  noNetworkAdpater.setConnected = function(){}; // stub, implement to receive connection status notification
  
  return noNetworkAdpater;
});
