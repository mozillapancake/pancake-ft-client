/** @license
 * RequireJS plugin for loading JSON files *at runtime only*
 * Author: Sam Foster
 * Version: 0.2.0 (2012/09/11)
 * Released under the MIT license
 */
define(['dollar'], function($){
  // 'dollar' is expected to provide an .ajax method which works like jquery's $.ajax
  return {
    // Just define 'load' from the Loader plugin API
    load : function(name, req, onLoad, config) {
      if(config.isBuild){
        onLoad(null); //we want to load the resource at runtime, not inline during build
      }else{
        $.ajax({ 
          url: req.toUrl(name),
          dataType: 'json',
          success: onLoad
        });
      }
    }
  };
});