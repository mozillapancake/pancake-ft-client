/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'dollar', 
  'lang', 
  'promise',
  'lib/middlewareAdapter',
  'logger'
], function(
  $,
  lang, 
  Promise,
  adapt,
  logger
){

  var plainAjax = $.ajax;
  var adaptedAjax = adapt(plainAjax, $); 

  function checkConnectionAvailability(){
    var promise = exports._connectionAvailablePromise;
    if(!promise){
      promise = exports._connectionAvailablePromise = new Promise();
      exports.plainAjax({
        type: 'HEAD',
        url: (config && config.availableStatusUrl) ? config.availableStatusUrl : '/ping.html',
        complete: function(xhr, textStatus){
          var code = Number(xhr.status);
          // console.log("ping status: ", code);
          if(code && code < 500){
            promise.resolve(true);
          } else {
            promise.reject(false);
          }
          exports._connectionAvailablePromise = null;
        }
      });
    }
    return promise;
  }
  
  var exports = {
    plainAjax: plainAjax,
    ajax: adaptedAjax,
    installAdapter: function(){
      if($.ajax !== adaptedAjax){
        console.log("lib/io installing $.ajax over: ", $.ajax.installedBy);
        $.ajax = adaptedAjax;
        adaptedAjax.installedBy = "lib/io.js";
      }
    },
    uninstallAdapter: function(){
      if($.ajax.restore){
        $.ajax =  $.ajax.restore();
      }
    },
    isConnected: true,
    setConnected: function(isConnected, args){
      isConnected = Boolean(isConnected);
      var stateChanged = exports.isConnected !== isConnected; 
      if(!stateChanged){
        // no change in status, so don't raise any change event
        logger.log("io.setConnected: "+isConnected+", no state change");
        return;
      }
      exports.isConnected = isConnected;
      // change in status, call the stub methods
      if(isConnected){
        logger.log("io.setConnected, calling onReconnection");
        exports.onReconnection(args);
      } else {
        logger.log("io.setConnected, calling onConnectionError");
        exports.onConnectionError(args);
      }
    },
    checkConnectionAvailability: checkConnectionAvailability,
    onConnectionError:function(){},
    onReconnection:function(){}
  };
  
  lang.each({
    get:"GET", put:"PUT", 'delete':"DELETE", post:"POST"
  }, function(value, key){
    exports[key] = function(settings){
      settings.type = val;
      return adaptedAjax(settings);
    };
  });

  return exports;
});
