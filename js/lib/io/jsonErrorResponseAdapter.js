define([], function(){

  function jsonErrorResponseAdapter(req){
    var success = req.success;
    this.callNext = true; // pass the request along the chain for the next handler
    req.success = function(resp, status, xhr){
      var respData = ('string' == typeof resp) ? JSON.parse(resp) : resp;
      if(!respData) respData = {}; // ensure we have an object before we start inspecting its properties
      if(
        ('success' in respData && !respData.success) ||
        ('error' in respData)
      ){
        // if the response includes a falsey success property, we need to fire error handlers
        return req.error.apply(req, [xhr, status, respData]);
      } else {
        return success.apply(req, arguments);
      }
    };
  }

  function canReturnJsonErrorResponse(req){
    var can = (req.dataType && req.dataType == 'json'); 
    return can;
  }
  
  jsonErrorResponseAdapter.canReturnJsonErrorResponse = jsonErrorResponseAdapter;
  
  jsonErrorResponseAdapter.name = "jsonErrorResponse";
  jsonErrorResponseAdapter.matcher = canReturnJsonErrorResponse;
  return jsonErrorResponseAdapter;
});