/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function() {

  var AdapterRegistry = function(){
    //  summary:
    //    A registry to make contextual calling/searching easier.
    //  description:
    //    Objects of this class keep list of arrays in the form [name, check,
    //    wrap, directReturn] that are used to determine what the contextual
    //    result of a set of checked arguments is. All check/wrap functions
    //    in this registry should be of the same arity.
    //  example:
    //  | // create a new registry
    //  | var reg = new AdapterRegistry();
    //  | reg.register("handleString",
    //  |   isString,
    //  |   function(str){
    //  |     // do something with the string here
    //  |   }
    //  | );
    //  | reg.register("handleArr",
    //  |   isArray,
    //  |   function(arr){
    //  |     // do something with the array here
    //  |   }
    //  | );
    //  |
    //  | // now we can pass reg.match() *either* an array or a string and
    //  | // the value we pass will get handled by the right function
    //  | reg.match("someValue"); // will call the first function
    //  | reg.match(["someValue"]); // will call the second

    this.pairs = [];
    this.callNext = false;
  };

  AdapterRegistry.prototype.register = function(/*String*/ name, /*Function*/ check, /*Function*/ wrap){
    //  summary:
    //    register a check function to determine if the wrap function or
    //    object gets selected
    //  name:
    //    a way to identify this matcher.
    //  check:
    //    a function that arguments are passed to from the adapter's
    //    match() function.  The check function should return true if the
    //    given arguments are appropriate for the wrap function.

    this.pairs.unshift([name, check, wrap]);
  };
  AdapterRegistry.prototype.registerDefault = function(handler){
    this.defaultHandler = handler;
  };
  

  AdapterRegistry.prototype.match = function(/* ... */){
      // summary:
      //    Find an adapter for the given arguments. If no suitable adapter
      //    is found, throws an exception. match() accepts any number of
      //    arguments, all of which are passed to all matching functions
      //    from the registered pairs.
      
      this.callArgs = Array.prototype.slice.call(arguments);
      for(var i = 0; i < this.pairs.length; i++){
        var pair = this.pairs[i];
        if(pair[1].apply(this, this.callArgs)){
          this.returnValue = pair[2].apply(this, this.callArgs);
          if(this.callNext){
            this.callNext = false;
            continue;
          } else {
            return this.returnValue;
          }
        }
      }
      // Is a default handler (think switch/default) call it
      if(this.defaultHandler){
        this.returnValue = this.defaultHandler.apply(this, this.callArgs);
        return this.returnValue;
      }
      // Dojo's AdapterRegistry throws on no match; we just return
    };

  AdapterRegistry.prototype.unregister = function(name){
    // summary:
    //    Remove a named adapter from the registry
    // name: String
    //    The name of the adapter.
    // returns: Boolean
    //    Returns true if operation is successful.
    //    Returns false if operation fails.

    // FIXME: this is kind of a dumb way to handle this. On a large
    // registry this will be slow-ish and we can use the name as a lookup
    // should we choose to trade memory for speed.
    for(var i = 0; i < this.pairs.length; i++){
      var pair = this.pairs[i];
      if(pair[0] == name){
        this.pairs.splice(i, 1);
        return true;
      }
    }
    return false;
  };
  
  AdapterRegistry.prototype.reset = function(name){
    this.pairs = [];
    // this.defaultHandler = null;
  };
  

  return AdapterRegistry;
});
