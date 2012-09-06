define(["dollar"], function($) {

  describe("Middleware usage", function() {

    it("Loads and exposes the expected API", function(){
      expect("TODO").toBe("Test implemented");
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