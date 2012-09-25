pancake-ft-client
=================

Front-end piece of the "french toast" pancake project

Setup
-----

The search/index.html (and other screens as we make them) are designed to be static. 

The app makes requests to /lattice, /browserid and other URLs not included in this repo. 
A node.js proxy server included at ./proxy/server.js can be run to reverse-proxy these requests to the python server apps that should handle them. 
You may need to adjust hostnames and ports in ./proxy/server.js as required. To run simply

```
cd ./proxy
npm install
npm start
open http://localhost/home.html
````

Note, although the package.json includes some *volo* properties, no install or volo commands are necessary to run the FE piece; the repo includes copies of all 3rd party dependencies.

Status
------

This repo is under heavy development, moving from proof-of-concept to working prototype. 

Key Ideas
---------

* Keep as much static and application-manifest-able as possible.
* Pages can initialize and render with anonymous/guest 'credentials'. The HTML is therefore static.
* Login updates `username`; this (and other settings) automatically refreshes and renders user-specific data on the page
* Queries are made against a client-side API (services/core, services/*), which accesses a client-side data store, which is backfilled with data from the server
* Query results are 'live'; as the store is updated, any changes to data matched by a query are reflected automatically
 
