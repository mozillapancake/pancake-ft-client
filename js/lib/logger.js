define(['lib/component'], function(Component){

  var LOGLEVEL = {
    log:    8,
    debug:  8,
    info:   4,
    warn:   2,
    error:  1
    // null: 0
  };
  
  
  var slice = Array.prototype.slice;

  var LoggingObserver = Component.extend({
    events: {
      'log': 'onEvent',
      'warn': 'onEvent',
      'error': 'onEvent' 
    },
    onEvent: function(evt){ 
      var name = evt.type,
          args = evt.args;
          args.push('</'+name.toUpperCase()+'>');
      return console[name].apply(console, args);
    }
  });
  // borrow Component's class extension static method
  LoggingObserver.extend = Component.extend;
  
  // logger just emits log/warn/error events, and any attached components handle them as appropriate
  var _Logger = Component.extend({
    getLevel: function(){
      if(this.hasOwnProperty('level')){
        return this.level;
      } else {
        return config ? LOGLEVEL[config.logging] || 0 : 0;
      }
    },
    plugins: {},
    log: function(){
      if(LOGLEVEL.log > this.getLevel()) {
        return;
      }
      this.trigger('log', {
        target: this,
        type: 'log', args: slice.call(arguments, 0)
      });
    },
    warn: function(){
      if(LOGLEVEL.warn > this.getLevel()) {
        return;
      }
      this.trigger('warn', {
        target: this,
        type: 'warn', args: slice.call(arguments, 0)
      });
    },
    error: function(){
      if(LOGLEVEL.error > this.getLevel()) {
        return;
      }
      this.trigger('error', {
        target: this,
        type: 'error', args: slice.call(arguments, 0)
      });
    },
    listenForUncaughtExceptions: function () {
      // register an onerror handler to log uncaught exceptions
      window.onerror = function(msg, filename, lineno){
        // onerror doesnt receive Error instances, need to try/catch further down for taht.
        // use some UncaughtError class here?
        var err = new Error(msg, filename, lineno);
        logger.error(err);
      };
      // only call once
      this.listenForUncaughtExceptions = function(){};
    }
  });

  var logger = new _Logger();

  logger.Observer = LoggingObserver;
  // provide a reference to a default logger
  logger.plugins.console = new logger.Observer();

  return logger;
});