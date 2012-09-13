// loader and application config
var config = {
  thumbnailerStatus: "{{thumbnailer_status_url}}?job={jobId}",
  thumbnailUrl: "http://s3.amazonaws.com/thumbnails-pancake-mozillalabs-com/{thumbnail_key}",
  latticeRoot: "/lattice",
  latticeUrl: "{latticeRoot}/{username}/{service}/{method}",
  // Set reference to index of app
  applicationRoot: "/",
  appVersion: "{{js_app_version}}",
  apiRoot: "/api/", 
  searchRoot: "{{search_url}}",
  searchResults: "http://"+ location.host +"/searchresult?query={?query?}&provider={provider}",
  logging: "{{logging}}",
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
    'EventEmitter': './vendor/EventEmitter'
  },
  packages: [
    // package mappings
    { name: 'store',   location: './vendor/store',      main: 'main' },
    { name: 'lang',     location: './vendor/lang',      main: 'underscore' },
    { name: 'knockout', location: './vendor/knockout',  main: 'knockout' },
    { name: 'compose',  location: './vendor/compose',   main: 'compose' },
    { name: 'promise',  location: './vendor/promised-io',   main: 'promise' },
    { name: 'pancake',  location: './pancake',   main: 'main' }
  ],
  // UTC timestamp 
  pageLoadStartTime: Date.now()+(new Date().getTimezoneOffset()*60000)
};
// some browser shims
config.platform = 'web';
config.paths.verifiedemail = 'lib/verifiedemail.browser';
config.paths.xmessage = 'lib/xmessage.browser';
// Use the browser logger in the browser environment.
config.paths.logger = 'lib/logger.browser';
