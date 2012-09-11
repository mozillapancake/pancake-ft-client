var express = require('express');
var path = require('path');
var app = express();
var httpProxy = require('http-proxy');

var docRoot = path.join(__dirname, '..');

app.use(app.router);
app.use(express['static']( docRoot ));
app.use(express.directory( docRoot ));

//
// new instance of HttProxy is our server
//
var proxy = new httpProxy.RoutingProxy();

app.all('/user/*', function (req, res) {
  // forward user-api requests
  proxy.proxyRequest(req, res, {
    host: 'localhost',
    port: 4323
  });
});

app.all('/browserid/*', function (req, res) {
  // forward browserid requests
  proxy.proxyRequest(req, res, {
    host: 'localhost',
    port: 6543
  });
});

app.all('/lattice/*', function (req, res) {
  // forward lattice graph api requests
  console.log("Lattice " +req.method+ " request for " + req.url);
  proxy.proxyRequest(req, res, {
    host: 'play.fxhome.mozillalabs.com',
    port: 4322
  });
});

app.listen(3000);
console.log("Serving out of " + docRoot);
console.log("Listening on localhost:3000");

