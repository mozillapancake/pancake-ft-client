define(['dollar', 'lib/logger', 'lib/errors', 'lib/timestamp'], function($, logger, errors, timestamp){

  // logging observer to send all 'error' log messages to an exceptions service endpoint

  var options = config || {};
  var exceptionLogger = new (logger.Observer.extend({
    // custom observer that just watches 'error' events
    events: { 'error': 'onError' },
    onError: function(evt){
      var err = evt.args[0], 
          preparedError = new errors.ExportableError(err).prepare();

      return sendException(preparedError);
    }
  }))();

  function sendException(data) {
    var label, encoded_msg,
      url = (config && config.exceptionsUrl) ? config.exceptionsUrl : '/error';

    data.server_name = location.host;
    data.site = data.site || '';
    data.timestamp = data.timestamp || timestamp();

    encoded_msg = JSON.stringify({ data: [data] }, null, 2); // wrap exception data in metadata/request object
    
    $.ajax({
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      url: url,
      data: encoded_msg
    });
  }

  logger.plugins.exceptions = exceptionLogger;
  return exceptionLogger;
});