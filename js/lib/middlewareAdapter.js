define(['promise'], function(Promise){
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
          return resultValue.then(onResult, onResult);
        }
      }
      console.log("returning non-promised result: ", resultValue);
      return resultValue;
    };
    
    adapted.before = function(fn) {
      befores.push(fn);
    };
    adapted.after = function(fn) {
      afters.push(fn);
    };
    return adapted;
  }
  adapt.END = {};
  return adapt;
});