// loader and application config
var config = {
  thumbnailerStatus: "?job={jobId}",
  thumbnailUrl: "http://s3.amazonaws.com/thumbnails-pancake-mozillalabs-com/{thumbnail_key}",
  latticeRoot: "/lattice",
  latticeUrl: "/lattice/{username}/{service}/{method}",
  // Set reference to index of app
  applicationRoot: "/",
  appVersion: "0.0.1",
  apiRoot: "/api/", 
  searchRoot: "",
  searchResults: "http://"+ location.host +"/search/#search/{?terms?}",
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
// expose a platform category we can use to target different platforms/devices 
config.platform = device.category || (/iPad|iPhone/).test(device.platform) ? 'ios' : device.platform.toLowerCase();
