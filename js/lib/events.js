define([], function(){

var slice = Array.prototype.slice;
  
// from: Backbone.Events
// -----------------

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may `bind` or `unbind` a callback function to an event;
// `trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.bind('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var Events = {

  // Bind an event, specified by a string name, `ev`, to a `callback` function.
  // Passing `"all"` will bind the callback to all events fired.
  bind : function(ev, callback, context) {
    var calls = this._callbacks || (this._callbacks = {});
    var list  = calls[ev] || (calls[ev] = {});
    var tail = list.tail || (list.tail = list.next = {});
    tail.callback = callback;
    tail.context = context;
    list.tail = tail.next = {};
    return this;
  },

  // Remove one or many callbacks. If `callback` is null, removes all
  // callbacks for the event. If `ev` is null, removes all bound callbacks
  // for all events.
  unbind : function(ev, callback) {
    var calls, node, prev;
    if (!ev) {
      this._callbacks = null;
    } else if (calls = this._callbacks) {
      if (!callback) {
        calls[ev] = {};
      } else if (node = calls[ev]) {
        while ((prev = node) && (node = node.next)) {
          if (node.callback !== callback) continue;
          prev.next = node.next;
          node.context = node.callback = null;
          break;
        }
      }
    }
    return this;
  },

  // Trigger an event, firing all bound callbacks. Callbacks are passed the
  // same arguments as `trigger` is, apart from the event name.
  // Listening for `"all"` passes the true event name as the first argument.
  trigger : function(eventName) {
    var node, calls, callback, args, ev, events = ['all', eventName];
    if (!(calls = this._callbacks)) return this;
    while (ev = events.pop()) {
      if (!(node = calls[ev])) continue;
      args = ev == 'all' ? arguments : slice.call(arguments, 1);
      while (node = node.next) if (callback = node.callback) callback.apply(node.context || this, args);
    }
    return this;
  }

};
return Events;
});
