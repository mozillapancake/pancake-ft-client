/** @license
 * RequireJS plugin for loading device info from the app container
 * - depends on xmessage transport
 * Author: Sam Foster
 * Version: 0.1.0 (2012/05/30)
 * Released under the MIT license
 */
define(['xmessage'], function(xmessage){


    // plugin API implementation
    return {
        load : function(name, req, onLoad, config) {
          if(config.isBuild){
            onLoad(null); //we want to load the resource at runtime, not inline during build
          }else{
            // create a transport for the given target name
            xmessage.sendMessage('native', 'info', [{}], function(resp){
              onLoad( resp.success ? resp.result : resp );
            });
          }
        }
    };
});