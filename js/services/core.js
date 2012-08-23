define(['vendor/store/main', 'underscore'], function(store, util){

  // local proxy for data stored and shared across the application
  // could be seeded from localStorage
  // maybe use Cache to have a front and server-backed store
  var storeData = [];

  // -------------------
  // Init the store
  //
  // put our app settings in the store
  var settings = {};
  // take default settings from window.config
  settings = util.defaults(settings, config || {}, {
    username: "guest"
  });
    
  var settingsRows = Object.keys(settings).map(function(key){
    return { type: 'setting', id: 'setting/'+key, value:  settings[key] };
  });
  storeData.push.apply(storeData, settingsRows);

  // ensure there's at least the default user in the store
  var usersRows = [];
  // add the default user
  usersRows.push({ username: settings.username, type: 'user', id: 'user/'+settings.username });
  storeData.push.apply(storeData, usersRows);
  

  var dataStore = store.Observable(new store.Memory({
    data: storeData
  }));

  // settings shorthand
  dataStore.settings = function(){
    console.warn("dataStore.settings: TODO"); 
    return dataStore.query({ type: 'setting' });
  };
  
  dataStore.settings.get = function(key){
    return dataStore.get('setting/'+key);
  };
  dataStore.settings.set = function(key, value){
    var overwrite = true;
    var setting = dataStore.get('setting/'+key); 
    if(undefined === setting) {
       setting = { type: 'setting', id: 'settings/'+key, value: value };
       overwrite = false;
    }
    return dataStore.put(setting, { overwrite: overwrite });
  };
  
  return dataStore;
});