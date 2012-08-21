/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['lib/logger', 'lib/objecttools'], function(logger, objectTools){

  // a logging observer which alerts all errors
  
  var options = config || {};
  var slice = Array.prototype.slice;

  var alertCount = 0, 
      maxAlerts = 3; // spare them the endless-modals-issue

  function reset(){
    alertCount = 0;
    maxAlerts = 3;
  }
  
  function noisyError(){
    var type = 'error';
    var msgs = slice.call(arguments),
        message, arg;
    // Stringify any objects passed in.
    for (var i=0; i < msgs.length; i++) {
      arg = msgs[i];
      try {
        if('string' === typeof arg){
          msgs[i] = arg;
        } else {
          msgs[i] = (arg instanceof Error) ? arg.toString() : objectTools.serializeObject( arg );
        }
      } 
      catch (e) {
        logger.log("logger failed to serialize object, what was it? " + objectTools.getType(arg));
        // Do something?
      }
    }
    
    // Join "msgs" array into a string separated by commas.
    message = msgs.join(', ');
    
    // in yo' face!
    alert(type + ": " + message);
    alertCount++;
    if(alertCount >= maxAlerts) {
      if(confirm("Something's obviously wrong, are you sure you want to keep getting these alerts?")){
        maxAlerts*= 2; 
        alertCount = 0;
      } else {
        logger.detach(noisyLogger);
        reset();
      }
    }
  }

  var noisyLogger = new (logger.Observer.extend({
    // custom observer that just watches 'error' events
    events: { 'error': 'onError' },
    onError: function(evt){
      return noisyError.apply(null, evt.args);
    }
  }))();

  // register this plugin
  logger.plugins.noisy = noisyLogger;
  return logger;
});
