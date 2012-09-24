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
