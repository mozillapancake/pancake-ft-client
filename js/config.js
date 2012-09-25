// some shims
if(!console){
  console = {};
  console.log = console.warn = console.error = console.info = function(){};
}
if(!('device' in window)){
  // shim Cordova WebView device api
  window.device = {
    name: '',
    cordova: '',
    platform: (/(iPhone|iPad|Android)/).exec(navigator.userAgent) ? RegExp.$1 : 'browser',
    uuid: '',
    version: ''
  };
}

// loader and application config
var config = {
  // expose a platform category we can use to target different platforms/devices 
  // TODO: this is crude logic and might need to be much finer-grained
  platform: device.category || (/iPad|iPhone/).test(device.platform) ? 'ios' : device.platform.toLowerCase(),
  
  // application settings
  thumbnailerStatus: "?job={jobId}",
  thumbnailUrl: "http://s3.amazonaws.com/thumbnails-pancake-mozillalabs-com/{thumbnail_key}",
  latticeRoot: "/lattice",
  latticeUrl: "/lattice/{username}/{service}/{method}",
  // Set reference to index of app
  applicationRoot: "/",
  appVersion: "0.0.1",
  apiRoot: "/api/", 
  searchRoot: "",
  searchResults: "http://"+ location.host +"/results.html#search/{?terms?}",
  logging: "dev",
  social: {
    twitter: {
      service_url: "http://twitter.com"
    },
    facebook: {
      service_url: "http://facebook.com"
    }
  },
  analyticsUrl: "/lattice/stats",
  exceptionsUrl: "/lattice/exceptions",

  // loader settings
  paths: {
    'dollar': './lib/dollar',
    'json': './lib/json',
    'text': './vendor/plugin/text',
    'lscache': './vendor/lscache',
    'zepto': './vendor/zepto',
    'EventEmitter': './vendor/EventEmitter',
    'path': './vendor/path'
  },
  packages: [
    // package mappings
    { name: 'store',   location: './vendor/store',      main: 'main' },
    { name: 'lang',     location: './vendor/lang',      main: 'underscore' },
    { name: 'knockout', location: './vendor/knockout',  main: 'knockout' },
    { name: 'compose',  location: './vendor/compose',   main: 'compose' },
    { name: 'promise',  location: './vendor/promised-io',   main: 'promise' }
  ],
  // UTC timestamp 
  pageLoadStartTime: Date.now()+(new Date().getTimezoneOffset()*60000)
};


// platform-specific package mapping for the 'pancake' requirejs package
config.packages.push({ name: 'pancake',  location: './pancake',   main: config.platform });
// platform-specific package mapping for the 'verifiedemail' requirejs package
config.packages.push({ name: 'verifiedemail',  location: './lib',   main: 'verifiedemail.'+config.platform });
// platform-specific package mapping for the 'xmessage' requirejs package
config.packages.push({ name: 'xmessage',  location: './lib',   main: 'xmessage.'+config.platform });
// Use the browser logger in the browser environment.
config.packages.push({ name: 'logger',  location: './lib',   main: 'logger' });

