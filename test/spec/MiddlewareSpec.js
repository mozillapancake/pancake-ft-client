define(["dollar"], function($) {

  // adapt a function to have a 'register' method, allowing handlers to be registered for calls to it
  var middleware = {
    adapt: function(fn, ctx) {
      var middlewares = [];
      var adapted = function(){
        var args = Array.prototype.slice.call(arguments);

        // get the subset of registered handlers that wish to participate based on the call args
        var stack = middlewares.filter(function(mware){
          return mware.accept.apply(mware, args);
        });
        
        // request phase
        args = stack.reduce(function(returnArgs, mware){
          if(mware.processRequest) {
            returnArgs = mware.processRequest.apply(null, returnArgs);
          }
          return returnArgs;
        }, args);

        // call the original with the modified args to get a result
        var result = fn.apply(ctx||null, args);

        // response phase
        result = stack.reduce(function(resp, mware){
          if(mware.processResponse) {
            resp = mware.processResponse.call(null, resp);
          }
          return resp;
        }, result);
        
        return result;
      };
      adapted.original = fn;
      adapted.register = function(mware) {
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

    it("Loads and exposes the expected API", function(){
      expect(middleware).toBeTruthy();
      expect(typeof middleware.adapt).toBe('function');
    });

    it("Allows functions to be adapted to accept middleware", function(){
      var doSomething = function(a, b){ return a + b; };
      var doubleArgs = function(a, b) {
        return [ a*2, b*2 ];
      };
      var squareResult = function(res) {
        return res*res;
      };
      var doubleAndThenSquare = {
        accept: function(a,b){ var is = ('number'==typeof a && 'number'==typeof b); console.log("accept: ", a, b, is); return is; },
        processRequest: doubleArgs,
        processResponse: squareResult
      };

      // test function unadapted
      expect(doSomething(1,2)).toBe(3);

      // adapt it to allow registration of middleware
      doSomething = middleware.adapt(doSomething);
      
      expect(typeof doSomething).toBe('function');
      expect(typeof doSomething.register).toBe('function');

      doSomething.register(doubleAndThenSquare);
      
      expect(doSomething(1,2)).toBe(36);
      
      // put it back how it was
      doSomething = doSomething.restore();
      expect(doSomething(2,3)).toBe(5);
      
    });

    it("Allows registration of middleware to match certain requests", function(){
      expect("TODO").toBe("Test implemented");
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