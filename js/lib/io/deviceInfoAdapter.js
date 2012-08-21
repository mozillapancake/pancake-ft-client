define([
  'device!native'
], 
function(device){

  var needsDeviceInfo = function(req){
    // only append device info to requests to /lattice/stats or /lattice/exception
    var is = (
      req.url && 
      (
          req.url.indexOf(config.latticeRoot +'/exception') > -1 ||
          req.url.indexOf(config.latticeRoot +'/stats') > -1
      )
    );
    return is;
  };
  
  function deviceInfoAdapter(req){
    this.callNext = true; // pass the request along the chain for the next handler
    var beforeSend = req.beforeSend;
    req.beforeSend = function(xhr, settings){
      // add the version info for the js app
      xhr.setRequestHeader('X-JsAppVersion', config.appVersion);
      // add the device and client info
      for(var p in device){
        xhr.setRequestHeader('X-'+p[0].toUpperCase()+p.substring(1), device[p]);
      }
      if(beforeSend) beforeSend.apply(this, arguments);
    };
  }
  
  deviceInfoAdapter.name = "deviceInfoAdapter";
  deviceInfoAdapter.matcher = needsDeviceInfo;

  return deviceInfoAdapter;
});