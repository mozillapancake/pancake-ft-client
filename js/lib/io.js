/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  '$', 
  'lang', 
  'lib/registry', 
  'promise',
  'lib/io/noNetworkAdapter',
  'logger'
], function(
  $, 
  util, 
  Registry, 
  Promise,
  noNetworkIoAdapter,
  logger
){
  var registry = new Registry();
  var plainAjax = $.ajax;
  
  var request = function(settings){
    return registry.match(settings);
  };

  var adaptedAjax = function(options){
    // zepto's $.ajax doesn't return promises like jquery 1.6+
    var onsuccess = options.success, 
        onerror = options.error,
        promise = new Promise();
        
    options.success = function(){
      if(onsuccess) onsuccess.apply(this, arguments);
      return promise.resolve.apply(promise, arguments);
    };
    options.error = function(xhr, status, err){
      if(onerror) onerror.apply(this, arguments);
      return promise.reject.call(promise, arguments[0], Boolean("dont throw on error"));
    };
    
    this.callNext = true; // pass the request along the chain for the next handler
    request.apply(null, arguments);
    return promise;
  };

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
    installAdapter: function(){
      if($.ajax !== adaptedAjax){
        $.ajax = adaptedAjax;
        // register the original, default ajax function as a handler. It should always match
        registry.registerDefault(util.bind(plainAjax, $));
        
        // replace the adapters 'setConnected' stub with ours
        noNetworkIoAdapter.setConnected = exports.setConnected;
        registry.register(noNetworkIoAdapter.name, noNetworkIoAdapter.matcher, noNetworkIoAdapter);

      }
    },
    uninstallAdapter: function(){
      $.ajax = plainAjax;
    },
    request: request,
    _registry: registry,
    register: function(name,matchFn,handlerFn,priority){
      // register a handler for some request
      return registry.register.apply(registry, arguments);
    },
    reset: function(){
      registry.reset();
    },
    registry: registry,
    
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
  
  util.each({
    get:"GET", put:"PUT", 'delete':"DELETE", post:"POST"
  }, function(value, key){
    exports[key] = function(settings){
      settings.type = val;
      return request(settings);
    };
  });

  return exports;
});
