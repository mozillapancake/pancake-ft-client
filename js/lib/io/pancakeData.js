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
  dataRequestAdapter.name = "dataRequestAdapter";
  dataRequestAdapter.matcher = isDataRequest;

  function dataRequestAdapter(args, res, next){
    var req = args[0];
    // map store request urls to their proper lattice urls
    var url = Url.parse(req.url);
    var query = url.query || {};
    console.log("dataRequestAdapter, request for: ", req);
    switch(query.type) {
      case 'user':
        req.url = '/lattice/session/active';
        break;
      case 'top_rated': 
        url.path = ['',
          settings.username(), 
          'stack', 
          'top_rated'
        ].join('/');
        console.log("top_rated url: ", url, url.toString());
        delete query.type;
        req.url = url.toString();
        req.envelope = 'd';
        break;
      case 'search': 
        console.log("username: ", settings.username());
        url.path = [
          '', 
          settings.username(),
          'stack', 
          'search'
        ].join('/');
        console.log("url: ", url, url.toString());
        delete query.type;
        req.url = url.toString();
        req.envelope = 'd';
        break;
    }
    next(args, res);
  }

  function dataResponseAdapter(args, res, next){
    var req = args[0];
    // filter responses to  store requests
    var url = Url.parse(req.url);
    var query = url.query || {};
    console.log("dataResponseAdapter, response to: ", req);
    switch(query.type) {
      case 'user':
      case 'top_rated': 
      case 'search': 
        break;
    }
    next(args, res);
  }
  dataResponseAdapter.name = "dataResponseAdapter";
  dataResponseAdapter.matcher = function(req){
    return (req.dataType && req.dataType == 'json');
  };
  
  return {
    requestAdapter: dataRequestAdapter,
    responseAdapter: dataResponseAdapter
  };
});