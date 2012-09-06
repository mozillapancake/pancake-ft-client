define(['promise'], function(Promise){
  var undef;
  function adapt(originalFn, ctx) {
    var befores = [];
    var afters = [];
    var adapted = function() {
      var callArgs = Array.prototype.slice.call(arguments);
      console.log("Adapted called with: ", callArgs);
      var resultValue; // initial return value is undefined
      var proceed = true;
      var i;
      var fn;

      var next = function(a,r, flag){
        if(arguments.length) {
          callArgs = a; resultValue = r;
          proceed = true;
        }
        if(adapt.END === flag) {
          proceed = false;
        }
      };
      var onResult = function(res){
        resultValue = res;
        console.log("originalFn gave back: ", resultValue);
        for(i=0; proceed && i<afters.length; i++) {
          fn = afters[i];
          proceed = false;
          fn(callArgs, resultValue, next);
        }
        return resultValue;
      };
      
      for(i=0; proceed && i<befores.length; i++) {
        fn = befores[i];
        proceed = false;
        fn(callArgs, resultValue, next);
      }
      if(proceed) {
        console.log("calling originalFn with callArgs: ", callArgs);
        resultValue = originalFn.apply(ctx || null, callArgs);
        if('function' === typeof resultValue.then) {
          console.log("originalFunction returned a promise");
          var defd = Promise.defer(); // return our own promise
          var promisedResult = resultValue;
          resultValue = undef;
          promisedResult.then(function(resp){
            onResult(resp);
            defd.resolve(resultValue);
          }, function(err){
            // FIXME: how do we want to handle errors here? 
            // they are just passed into the result handlers for now
            onResult.apply(null, arguments);
            defd.reject(resultValue);
          });
          return defd.promise;
        } else {
          console.log("returning non-promised result: ", resultValue);
          return onResult(resultValue);
        }
      }
      console.log("no after-filters, returning result: ", resultValue);
      return resultValue;
    };
    
    adapted.before = function(fn) {
      befores.push(fn);
    };
    adapted.after = function(fn) {
      afters.push(fn);
    };
    adapted.restore = function() {
      afters = []; befores = []; 
      return originalFn;
    };
    return adapted;
  }
  adapt.END = {};
  return adapt;
});