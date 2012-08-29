amd-store
=========

amd-store is a port of the dojo/store collection of modules, adapted to extract the dojo dependencies and facilitate use as a library in applications employing AMD. 

It has light dependencies, including some language utilities provided here in lib/util.js, as well as a Deferred/Promise implementation, provided in lib/Promise.js.

Testing
-------

The tests have been ported to use Jasmine, with a node.js server implementation of the test.php script used to examine request/response behaviour. 
To run the tests: 

```
node tests/server.js &
open http://localhost:8080/tests/SpecRunner.html
````
