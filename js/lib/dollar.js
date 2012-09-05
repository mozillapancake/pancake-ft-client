define(['zepto', 'promise'], function($, Promise){

  var originalAjax = $.ajax;
  var hasPromises = false;
  // test to see if this implementation of $.ajax returns promises or not
  var req = $.ajax({
    beforeSend: function(){
      return false;
    }
  });
  if(req && req.then) {
    hasPromises = true;
  }
  
  var adaptedAjax = function(options){
    console.log("dollar.js, adaptedAjax call");
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
    
    originalAjax.apply($, arguments);
    return promise;
  };

  if(!hasPromises) {
    console.log("dollar.js, wrapping $.ajax to return promises");
    $.ajax = adaptedAjax;
  }
  return $;
});