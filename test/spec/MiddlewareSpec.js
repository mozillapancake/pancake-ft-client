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
      var allNumbers = function() {
        var args = Array.prototype.slice.call(arguments);
        return args.every(function(n) { 
          return 'number'===typeof n; 
        });
      };

      var sumArguments = function(a, b){ 
        return a + b; 
      };
      var timesTwoMiddleware = function(args, res, next) {
        next(args, res*2 );
      };
      expect( sumArguments(1,4) ).toBe(5);
      
      sumArguments = adapt(sumArguments);
      sumArguments.after(function(args, res, next){
        return allNumbers.apply(null, args) ? 
            timesTwoMiddleware(args, res, next) : 
            next(args, res);
      });
      expect( sumArguments(3,7) ).toBe(20);
      expect( sumArguments("8",1) ).toBe('81');
    });

  });

  describe("Middleware functionality", function() {
    var firstFoo = function(args, res, next){
      args[0].foo += ':1st';
      next(args, res);
    }; 
    var secondFoo = function(args, res, next){
      args[0].foo += ':2nd';
      next(args, res);
    };
    var afterFoo = function(args, res, next){
      res += ':after';
      next(args, res);
    };
    
    var doSomething = function(options) {
      return options.foo;
    };

    it("Modifies the request in the expected order", function(){
      var func = adapt(doSomething); 
      expect(doSomething({ foo: 'bar' })).toBe('bar');

      func.before(firstFoo);
      func.after(afterFoo);
      func.before(secondFoo);
      
      expect(func({ foo: 'start' })).toBe('start:1st:2nd:after');
    });

    it("Allows dismantling of the middleware chain to restore the original function", function(){
      var func = adapt(doSomething); 
      expect(doSomething({ foo: 'bar' })).toBe('bar');
      expect(func({ foo: 'bar' })).toBe('bar');

      func.after(afterFoo);
      
      expect(func({ foo: 'start' })).toBe('start:after');
      
      func = func.restore();

      expect(func({ foo: 'start' })).toBe('start');
    });

    it("Allows a middleware can shortcut the chain", function(){
      var func = adapt(doSomething); 
      func.before(firstFoo);
      func.before(function(args, res, next){
        res = doSomething.apply(null, args);
        next(args, res, adapt.END);
      });
      func.after(afterFoo);
      func.before(secondFoo);
      
      expect(func({ foo: 'start' })).toBe('start:1st');
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