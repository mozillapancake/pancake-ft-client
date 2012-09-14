define(['lib/url', 'promise'], function(Url, Promise){

  var isJsonResultRequest = function(req){
    // only re-route json requests to /pancake/*
    // check for 'envelope' request property, or do some response type and path matching
    var is = Boolean(req.envelope) ||        
    (
      (req.dataType && req.dataType == 'json') &&
      req.url && 
      (
          req.url.indexOf('/pancake/') > -1
      )
    );
    // console.log("isJsonResultRequest? ", req.url, is);
    return is;
  };

  function jsonResultAdapter(args, respData, next){
    var req = args[0];
    if(!respData) respData = {}; // ensure we have an object before we start inspecting its properties
    if(
      ('success' in respData && !respData.success)
    ){
      // actually, this looks more like an error response, we need to fire error handlers
      // TODO: rewind the middleware stack to start over with this error response
      return req.error.apply(req, [xhr, status, respData]);
    } else {
      // if the response looks good, pass back the 'd' results array when defined
      next(args, respData.d || respData);
    }
  }
  // as middleware: 
  //    request phase: 
  
  jsonResultAdapter.name = "jsonResultAdapter";
  jsonResultAdapter.matcher = isJsonResultRequest;

  return jsonResultAdapter;
});