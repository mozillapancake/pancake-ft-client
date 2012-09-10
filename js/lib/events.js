define(['EventEmitter'], function(EventEmitter){

var slice = Array.prototype.slice;
  
// shim to provide: Backbone.Events-like API over the EventEmitter

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may `bind` or `unbind` a callback function to an event;
// `trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.bind('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var Events = EventEmitter.prototype;

Events.bind = function(name, callback, context) {
 this.addListener(name, context ? callback.bind(context) : callback);
 return this;
};

  // Remove one or many callbacks. If `callback` is null, removes all
  // callbacks for the event. If `ev` is null, removes all bound callbacks
  // for all events.
Events.unbind = function(name, callback) {
  this.removeListener(name, callback);
  return this;
};

  // Trigger an event, firing all bound callbacks. Callbacks are passed the
  // same arguments as `trigger` is, apart from the event name.
  // Listening for `"all"` passes the true event name as the first argument.
Events.trigger = function(name) {
  this.emitEvent(name, slice.call(arguments, 1));
    return this;
};

return Events;

});
