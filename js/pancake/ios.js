window.FrenchToast = window.Pancake = {

    _sendToNative: function(name, arguments) {
        var json = { destination: 'native', call: { name: name, arguments: arguments } };
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

    // The client can use this to register for layer focus events

    _layerFocusHandler: null,

    registerLayerFocusHandler: function(fn) {
        this._layerFocusHandler = fn;
    },

    // This is called directly by the native code

    dispatchLayerFocusEvent: function(url) {
        this._layerFocusHandler(url);
    },

    // 'External'

    getSession: function() {
        // This should make a call to the backend
        alert("Not implemented yet");
    },

    startBrowserId: function(cb) {
        // This should make a call to the BrowserID code
        alert("Not implemented yet");
    },

    validateBrowserIdReceipt: function(receipt, cb) {
        // This should make a call to the backend
        alert("Not implemented yet");
    }

};