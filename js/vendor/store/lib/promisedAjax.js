/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'dollar', 
  'promise'
], function(
  $, 
  Promise
){

  var adaptedAjax = function(options){
    // zepto's $.ajax doesn't return promises like jquery 1.6+
    var onsuccess = options.success, 
        onerror = options.error,
        promise = new Promise();
        
    options.success = function(data, status, xhr){
      promise.xhr = xhr;
      if(onsuccess) onsuccess.apply(this, arguments);
      return promise.resolve.apply(promise, arguments);
    };
    options.error = function(xhr, status, err){
      promise.xhr = xhr;
      if(onerror) onerror.apply(this, arguments);
      return promise.reject.call(promise, arguments[0], Boolean("dont throw on error"));
    };
    
    $.ajax.apply($, arguments);
    return promise;
  };

  var exports = {
    ajax: adaptedAjax,
    param: function(){
      return $.param.apply($, arguments);
    }
  };
  
  var methodTypes = {
    get:"GET", put:"PUT", 'delete':"DELETE", post:"POST"
  }; 
  function assignMethod(method, type){
    exports[key] = function(settings){
      settings.type = type;
      return $.ajax.call($, settings);
    };
  }
  for(var key in methodTypes){
    assignMethod(key, methodTypes[key], methodTypes);
  }

  return exports;
});
