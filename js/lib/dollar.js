define(['zepto', 'promise'], function($, Promise){

  var originalAjax = $.ajax;
  var hasPromises = false;
  var undef;
  // test to see if this implementation of $.ajax returns promises or not
  var req = $.ajax({
    beforeSend: function(xhr){
      return false;
    }
  });
  if(req && req.then) {
    hasPromises = true;
  }
  
  var promiseAdaptedAjax = function(options){
    options = options || {};
    console.log("dollar.js, adaptedAjax call");
    // zepto's $.ajax doesn't return promises like jquery 1.6+
    var onsuccess = options.success, 
        onerror = options.error,
        defd = Promise.defer();

    if(options.onsuccess || options.error){
      defd.promise.then(options.onsuccess, options.error);
    }

    options.success = function(data, status, xhr){
      console.log("dollar success; got response data: ", data);
      var ret = defd.resolve.apply(defd, arguments);
      return ret;
    };
    options.error = function(xhr, status, err){
      return defd.reject.call(defd, arguments[0], Boolean("dont throw on error"));
    };
    
    originalAjax.apply($, arguments);
    return defd.promise;
  };

  if(!hasPromises) {
    console.log("dollar.js, wrapping $.ajax to return promises");
    promiseAdaptedAjax.installedBy = "dollar.js";
    $.ajax = promiseAdaptedAjax;
  }
  return $;
});