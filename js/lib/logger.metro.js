/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'lib/logger', 
  'lib/objecttools',

  // logger plugins
  'lib/logger/noisy',
  'lib/logger/remoteexceptions'

], function (logger, objectTools) {
  // override onEvent to serialize and writeToConsole
  logger.plugins.console.onEvent = function(evt){ 
    var type = evt.type,
        rest = evt.args, 
        message, arg;

    // Stringify any objects passed in.
    for (var i=0; i < rest.length; i++) {
      arg = rest[i];
      try {
          rest[i] = objectTools.serializeObject( arg );
      } 
      catch (e) {
        logger.log("logger failed to serialize object, what was it? " + objectTools.getType(arg));
        // Do something?
      }
    }

    // Join "rest" array into a string separated by commas.
    message = rest.join(', ');
    writeToConsole(type, message);
  }; 

  function writeToConsole(type, msg){
    // Create URL with log type and message.
    var a = {"destination":"native", "call": {"name": type, "arguments":[{"msg": msg}]}}
    window.external.notify(JSON.stringify(a));
  }
  
  // register all the loaded plugins
  var plugins = logger.plugins || {};
  for(var cname in plugins){
    logger.log("attaching logging plugin: " + cname);
    logger.attach(plugins[cname]);
  }
  
  // send uncaught exception to the logger
  logger.listenForUncaughtExceptions();
  
  logger.log("logger initialized with level: " + logger.getLevel());

  return logger;
});
