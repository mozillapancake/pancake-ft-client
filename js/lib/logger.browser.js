/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 define([
   'lib/logger', 
   'lib/objecttools',

   // logger plugins
   'lib/logger/remoteexceptions'

 ], function (logger, objectTools) {

  // register all the loaded plugins
  var plugins = logger.plugins || {};
  for(var cname in plugins){
    logger.attach(plugins[cname]);
  }
  
  logger.log("logger initialized with level: " + logger.getLevel());
  // logger.listenForUncaughtExceptions();
  return logger;
});
