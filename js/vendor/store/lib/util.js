define(function(){

  function mixin(obj){
    var args = Array.prototype.slice.call(arguments, 1), 
        empty = {};
    args.forEach(function(source){
      for(var p in source) {
        if(p in empty) continue; 
        obj[p] = source[p];
      }
    });
    return obj;
  }

  function create(obj){
    var clone, empty = {};
    if(obj instanceof Array){
      clone = obj.map(function(m){
        return typeof m =="object" ? create(m) : m;
      });
    } else if(typeof obj == "object"){
      clone = Object.create(obj);
      for(var p in obj) {
        if(p in empty || undefined === p) continue;
        if('object' == typeof obj[p]) {
          // recursive treatment of objects
          // FIXME: descends infinitely on circular refs?
          clone[p] = create(obj[p]);
        }
      }
    } else {
      clone = obj;
    }
    Array.prototype.slice.call(arguments, 1).forEach(function(arg){
      mixin(clone, arg);
    });
    return clone;
  }

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // OO helpers barrowed from Backbone
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    mixin(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) mixin(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) mixin(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };
  
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };
  
  return {
    create: create,
    mixin: mixin,
    extend: extend,
    inherits: inherits
  };
});