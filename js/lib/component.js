define(['compose','lib/events'], function(Compose, Evented){

  function each(objOrArray, fn, thisObject){
    if('function' === typeof objOrArray.forEach) {
      objOrArray.forEach(fn, thisObject);
    } else {
      for(var key in objOrArray) {
        fn.call(thisObject, objOrArray[key], key, objOrArray);
      }
    }
  }
  
  var Component = Compose(Compose, Evented, {
    _components: [],
    events: {},
    // override bind to return a pre-wired function to perform the unbind
    bind: function(name, callback, context){
      var self = this;
      Evented.bind.apply(self, arguments);
      return function(){
        Evented.unbind.call(self, name, callback);
      };
    },
    // attach-er methods
    attach: function(component){
      // explicitly attach another component to me
      this._components.push(component);
      component.onAttach(this);
    },
    detach: function(component){
      // explicitly detach another component to me
      var idx = this._components.indexOf(component);
      if(idx > -1) this._components.splice(idx, 1);
      if(component.onDetach) component.onDetach(this);
    },
    detachAll: function(){
      // explicitly detach all components from me
      var component, components = this._components;
      while((component = components.shift())){
        if(component.onDetach) component.onDetach(this);
      }
    },
    
    // attachee methods
    onAttach: function(target){
      // when we are attached to something else, our onAttach is called with the attachee 
      // could scope handles using the target's id, which would allow 1 component to be attached to more than one thing
      var handles = this._handles = [];
      // register event listeners
      var self = this;
      
      each(this.events, function(callback, name){
        // hook up listener for this event type
        if(typeof callback === 'string'){
          callback = this[callback];
        }
        
        // keep an undo function for when we detach
        handles.push( target.bind(name, callback) );
      }, this);
    },
    onDetach: function(target){
      // detach by calling the 'remove' method on each of the handles we were given
      // could scope handles using the target's id
      var unbind, handles = this._handles;
      while((unbind = handles.shift())){
        unbind();
      }
    }
  });

  Component.extend = function(){
    return Compose.apply(null, [this].concat(Array.prototype.slice.call(arguments)) );
  };
  
  return Component;
});