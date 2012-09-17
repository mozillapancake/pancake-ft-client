define([
  'services/settings'
], function(settings){
  console.log("sessionTokenAdapter, settings.session: ", settings.session);
  
  function sessionTokenAdapter(args, respData, next){
    var req = args[0];
    var beforeSend = req.beforeSend;
    req.beforeSend = function(xhr, options){
      xhr.setRequestHeader('X-XSRFToken', settings.session());
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
      data.csrf_token = settings.session();
      data = JSON.stringify(data);
    } else if(asString){
      if(data.length) data +='&';
      data += 'csrf_token='+ encodeURIComponent(settings.session());
    } else {
      data.csrf_token = settings.session();
    }
    req.data = data;
    // 
    // ----
    if(next) next(args, respData);
  }

  // match requests to intercept and inject csrf_token param
  var needsTokenRequest = function(req){
    // yes for /api/, no for /api/session
    var url = req.url, 
        retValue = (
              // yes for non-GET request to lattice apis
              req.type !== "GET" && 
              (
                url.indexOf(settings.apiRoot()) === 0 ||
                url.indexOf(settings.latticeRoot()) === 0
              )
        );
    return retValue;
  };
  
  sessionTokenAdapter.matcher = needsTokenRequest;
  sessionTokenAdapter.name = "sessionTokenAdapter";
  return sessionTokenAdapter;
  
});