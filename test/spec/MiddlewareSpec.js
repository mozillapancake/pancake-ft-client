define(['dollar', 'promise'], function($, Promise) {

  // adapt a function to have a 'register' method, allowing handlers to be registered for calls to it
  var middleware = {
    adapt: function(fn, ctx) {
      var befores = [], 
          afters: [];
      var onError = function(err){ console.warn("Error: ", err); };
      var adapted = function(){
        var args = Array.prototype.slice.call(arguments);

        // get the subset of registered handlers that wish to participate based on the call args
        var beforeStack = befores.slice();
        var next = function(req, resp) {
          var handler = beforeStack.shift();
          // if handler.accept(req, resp)
          handler(req, resp, function(){ })
        }
        beforeHandlers.forEach(function(mware){
          if(mware.accept && !mware.accept(args)) {
            return;
          }
          var next = function(){}
          return mware.accept && mware.accept(args) ? mware(args, resp, next) : args;
        });
        
        var stack = befores.filter(function(mware){
          
        });
        
        // request phase
        args = stack.reduce(function(returnArgs, mware){
          if(mware.processRequest) {
            returnArgs = mware.processRequest.apply(null, returnArgs);
          }
          return returnArgs;
        }, args);

        // call the original with the modified args to get a result
        var promise = Promise.when(fn.apply(ctx||null, args), function(result){
          // response phase
          result = stack.reduce(function(resp, mware){
            if(mware.processResponse) {
              resp = mware.processResponse.call(null, resp);
            }
            return resp;
          }, result);
          return result;
        }, onError);
        return promise;
      };
      adapted.original = fn;
      // register middleware function
      // to be applied when something is true
      adapted.registe = function() {
        middlewares.push(mware);
      };
      adapted.restore = function() {
        middlewares = null;
        return fn;
      };
      return adapted;
    }
  };
  
  describe("Middleware usage", function() {

    var doubleArgs = function(a, b) {
      return [ a*2, b*2 ];
    };
    var squareResult = function(res) {
      return res*res;
    };
    var doubleAndThenSquare = {
      accept: function(a,b){ var is = ('number'==typeof a && 'number'==typeof b); return is; },
      processRequest: doubleArgs,
      processResponse: squareResult
    };
    var reportResult = {
      accept: Boolean,
      processResponse: function(result) {
        return "Result was: " + result;
      }
    };

    it("Loads and exposes the expected API", function(){
      expect(middleware).toBeTruthy();
      expect(typeof middleware.adapt).toBe('function');
    });

    it("Allows functions to be adapted to accept middleware", function(){
      var doSomething = function(a, b){ return a + b; };
      var result; 

      // test function unadapted
      expect(doSomething(1,2)).toBe(3);

      // adapt it to allow registration of middleware
      doSomething = middleware.adapt(doSomething);
      expect(typeof doSomething).toBe('function');
      expect(typeof doSomething.register).toBe('function');

      doSomething.register(doubleAndThenSquare);

      Promise.when(doSomething(1,2), function(res){
        result = res;
      });

      waitsFor(function(){ return result; },1000);
      runs(function(){
        expect(result).toBe(36);

        // put it back how it was
        doSomething = doSomething.restore();
        expect(doSomething(2,3)).toBe(5);
      });
    });

    it("Allows registration of middleware to match certain requests", function(){
      var doSomething = function(a, b){ return a + b; };
      doSomething = middleware.adapt(doSomething);
      doSomething.register(doubleAndThenSquare);
      
    });

  });

  describe("Middleware functionality", function() {
    it("Modifies the request in the expected order", function(){
      expect("TODO").toBe("Test implemented");
    });
    it("Modifies the response in the expected order", function(){
      expect("TODO").toBe("Test implemented");
    });

    it("Allows a middleware can shortcut the chain", function(){
      expect("TODO").toBe("Test implemented");
    });

    it("Propagates errors in the response back up the chain", function(){
      expect("TODO").toBe("Test implemented");
    });

    it("Propagates errors in the request back up the chain", function(){
      expect("TODO").toBe("Test implemented");
    });

    it("Allows middleware to trigger errors", function(){
      expect("TODO").toBe("Test implemented");
    });

    it("Allows middleware to recover from errors", function(){
      expect("TODO").toBe("Test implemented");
    });
  });

  return {
    name: "Middleware"
  };
});