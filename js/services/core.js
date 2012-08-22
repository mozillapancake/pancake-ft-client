define(['vendor/store/main'], function(store){

  // local proxy for data stored and shared across the application
  // could be seeded from localStorage
  // maybe use Cache to have a front and server-backed store
  var storeData = [];
  
  // put our app settings in the store
  if(config) {
    var settings = config;
    settings.id = 'settings';
    storeData.push(settings);
  }

  // put the default user in the store
  var defaultUser = { username: 'guest', id: 'user' };
  storeData.push(defaultUser);
  
  var dataStore = new store.Memory({
    data: storeData
  });

  return dataStore;
});