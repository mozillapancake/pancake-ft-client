define([
  'lang', 'services/settings', 'store/Cache', 'store/Observable', 'store/JsonRest', 'store/Memory'
], function(lang, settings, CacheStore, Observable, JsonRest, Memory){

  // local proxy for data stored and shared across the application
  // could be seeded from localStorage
  // maybe use Cache to have a front and server-backed store

  // -------------------
  // Init the store
  //
  var storeData = [];

  var restStore = new JsonRest({
    target: '/pancake/'
  });
  var memoryStore = new Memory({
    data: storeData
  });
  
  var dataStore = Observable(new CacheStore( restStore, memoryStore ) );
  
  return dataStore;
});