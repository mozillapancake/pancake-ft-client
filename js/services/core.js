define(['vendor/store/main'], function(store){

  // local proxy for data stored and shared across the application
  // could be seeded from localStorage
  // maybe use Cache to have a front and server-backed store
  var dataStore = new store.Memory({
    data: []
  });

  return dataStore;
});