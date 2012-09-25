(function(define){
define([], function(){

  var PancakeAPI = {

      _sendToNative: function(name, args) {
        console.log("Not implemented", "_sendToNative", name, args);
      },

      openAppView: function(url) {
        window.open(url, 'appviewer');
      },

      openWebView: function(url) {
        console.log("Open %s in public viewer", url);
        window.open(url, 'publicviewer');
      },

      log: function(level, message) {
        level = level.toLowerCase();
        console[level].apply(console, Array.prototype.slice.call(arguments, 1));
      },
      // The client can use this to register for layer focus events

      _layerFocusHandler: null,

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
