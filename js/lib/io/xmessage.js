/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['xmessage', 'lib/uuid', 'promise'], function(xmessage, uuid, Promise){
  var exports = {};
  var slice = Array.prototype.slice;

  // define a request->response style transport using xmessages to a given window
  exports.create = function(dest) {
    var transport = exports[dest] || (exports[dest] = {
      destination: dest,
      send: function(name, msg){

        msg.origin = config.appName;
        var deferred = Promise.defer();

        // send 
        xmessage.sendMessage(this.destination, name, slice.call(arguments, 1), function(resp){
          // implement check to determine success:
          //  there are layers of success. 
          //  a message may be sent successfully and deliver back an error message as payload

          if(resp instanceof Error || ('success' in resp && !resp.success)){
            // xmessage transport failure
            return deferred.reject(resp, Boolean("dont throw on error"));
          } 
          var result = resp.result;
          if(result instanceof Error || ('success' in result && !result.success)){
            // application error: error/non-success message as response payload
            return deferred.reject(result, Boolean("dont throw on error"));
          }
          // resolve promise with the result, not the response envelope
          return deferred.resolve(resp.result);
        });
        return deferred.promise;
      }
    });
    return transport;
  };
  
  return exports;

});
