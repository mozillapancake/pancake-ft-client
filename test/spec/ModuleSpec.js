define(["test/SampleModule", "dollar"], function(SampleModule, $) {

  describe("Sample Module", function() {
    it('should have a name', function() {
      expect(SampleModule.name).toBe("sample");
    });
    
    it('should state the purpose', function() {
      expect(SampleModule.purpose).toBe("AMD testing");
    });

    it('should have its own dependencies', function() {
      expect(SampleModule.dependency).toBe($);
    });
  });

  describe("$ dependency", function(){
    it(('should be loaded'), function(){
      expect($).toBeDefined();
      expect(typeof $).toBe('function');
    });
  });

  return {
    name: "modulespec"
  };
});