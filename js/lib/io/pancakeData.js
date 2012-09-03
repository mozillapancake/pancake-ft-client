define(['lib/url', 'services/settings'], function(Url, settings){

  var isDataRequest = function(req){
    // only re-route json requests to /pancake/*
    var is = (
      (req.dataType && req.dataType == 'json') &&
      req.url && 
      (
          req.url.indexOf('/pancake/') > -1
      )
    );
    console.log("IsDataRequest? ", req.url, is);
    return is;
  };

  var username = settings.value('username');
  
  function dataRequestAdapter(req){
    this.callNext = true; // pass the request along the chain for the next handler
    
    var url = Url.parse(req.url);
    var query = url.query || {};
    console.log("dataRequestAdapter, request for: ", req);
    switch(query.type) {
      case 'user':
        this.callNext = false;
        return username();
      case 'search': 
        console.log("username: ", username());
        url.path = [
          '', 
          username(),
          'stack', 
          'search'
        ].join('/');
        console.log("url: ", url, url.toString());
        delete query.type;
        req.url = url.toString();
        break;
    }
    // map store request urls to their proper lattice urls
    // go to localStorage first where appropriate
  }
  
  dataRequestAdapter.name = "dataRequestAdapter";
  dataRequestAdapter.matcher = isDataRequest;

  return dataRequestAdapter;
});