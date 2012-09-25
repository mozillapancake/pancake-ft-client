(function(define){
define([], function(){
  var PancakeAPI = {

    _sendToNative: function(name, args) {
        var json = { destination: 'native', call: { 'name': name, 'arguments': args } };
        var body = JSON.stringify(json);
        var http = new XMLHttpRequest();
        http.open("POST", "http://localhost:1234/prefix/send", true);
        http.setRequestHeader("Content-type", "text/plain");
        http.setRequestHeader("Content-length", body.length);
        http.setRequestHeader("Connection", "close");
        http.send(body);
    },

    openAppView: function(url) {
        this._sendToNative('openAppView', [url]);
    },

    openWebView: function(url) {
        this._sendToNative('openWebView', [url]);
    },

    log: function(level, message) {
      PancakeAPI._sendToNative(level, Array.prototype.slice.call(arguments, 1));
    },

    // The client can use this to register for layer focus events

    _layerFocusHandler: null,

    registerLayerFocusHandler: function(fn) {
      this._layerFocusHandler = fn;
    },

    // This is called directly by the native code

    dispatchLayerFocusEvent: function(url) {
      this._layerFocusHandler(url);
    },

    // Incoming message - called directly by the native code

    handleCall: function(){
      // MessageThing.handleCall
      alert("handleCall: Not implemented yet");
    },

    // 'External'

    getSession: function() {
      // This should make a call to the backend
      alert("getSession: Not implemented yet");
    },

    startBrowserId: function(cb) {
      // This should make a call to the BrowserID code
      alert("startBrowserId: Not implemented yet");
    },

    validateBrowserIdReceipt: function(receipt, cb) {
      // This should make a call to the backend
      alert("validateBrowserIdReceipt: Not implemented yet");
    }

  };

  // returning the export of the module
  return PancakeAPI;

});
})(typeof define != "undefined" ?
  define: // AMD/RequireJS format if available
  function(deps, factory){
    if(typeof module !="undefined"){
      module.exports = factory(); // CommonJS environment, like NodeJS
    }else{
      window.FrenchToast = window.Pancake = factory(); // raw script, assign to Pancake/FrenchToast global
    }
  });
