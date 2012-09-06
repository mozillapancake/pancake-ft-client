define(['dollar', 'promise', 'lib/middlewareAdapter'], function($, Promise, adapt) {

  describe("Middleware usage", function() {

    var doubleArgs = function(a, b) {
      return [ a*2, b*2 ];
    };
    var squareResult = function(res) {
      return res*res;
    };
    var doubleAndThenSquare = function(args, result, next){
      args = doubleArgs.apply(null, args);
      args = squareResult.apply(null, args);
    };
    
    it("Loads and exposes the expected API", function(){
      expect(adapt).toBeTruthy();
      expect(typeof adapt).toBe('function');
      var adapted = adapt(function(){});
      expect(typeof adapted).toBe('function');
      expect(typeof adapted.before).toBe('function');
      expect(typeof adapted.after).toBe('function');
      expect(typeof adapted.restore).toBe('function');
    });

    it("Allows functions to be adapted to accept middleware", function(){
      var doSomething = function(a, b){ return a + b; };
      var result; 

      // test function unadapted
      expect(doSomething(1,2)).toBe(3);

      // adapt it to allow registration of middleware
      doSomething = adapt(doSomething);

      // double then square
      doSomething.before(function(args, res, next){
        next( doubleArgs.apply(null, args), res );
      });
      doSomething.after(function(args, res, next){
        next( args, squareResult(res) );
      });

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