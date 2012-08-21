define([
  'data!/api/session',
],
function(userSession){
  
  if(!(config)){
    throw "No config global";
  }
  // mixin the user session properties into our shared global config
  for(var key in userSession){
    config[key] = userSession[key];
  }

  function needsTokenAdapter(req){
    var beforeSend = req.beforeSend;
    req.beforeSend = function(xhr, settings){
      xhr.setRequestHeader('X-XSRFToken', config.csrf_token);
      if(beforeSend) beforeSend.apply(this, arguments);
    };
    
    // ----
    // legacy request body param injection for the csrf_token
    // TODO: remove when request headers are confirmed to be use and working everywhere
    var data = req.data || {}, 
        asString = "string" == typeof data;
    
    if(asString && (/^\s*\{/).test(data)) {
      // frozen JSON data
      data = JSON.parse(data);
      data.csrf_token = config.csrf_token;
      data = JSON.stringify(data);
    } else if(asString){
      if(data.length) data +='&';
      data += 'csrf_token='+ encodeURIComponent(config.csrf_token);
    } else {
      data.csrf_token = config.csrf_token;
    }
    req.data = data;
    // 
    // ----
    
    this.callNext = true; // pass the request along the chain for the next handler
  }

  // match requests to intercept and inject csrf_token param
  var needsTokenRequest = function(req){
    // yes for /api/, no for /api/session
    var url = req.url, 
        retValue = (
              // yes for non-GET request to lattice apis
              req.type !== "GET" && 
              (
                url.indexOf(config.apiRoot) === 0 ||
                url.indexOf(config.latticeRoot) === 0
              )
        );
    return retValue;
  };
  
  needsTokenAdapter.matcher = needsTokenRequest;
  needsTokenAdapter.name = "needsTokenRequest";
  return needsTokenAdapter;
  
});