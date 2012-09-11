define(['knockout', 'lang', 'store', 'lib/LsCacheStorage'], function(ko, lang, store, LocalStorage){
  
  var undef;
  var defaultSettings = {
    username: "guest",
    session: ""
  };
  
  var idPrefix = (config && config.localStorageIdPrefix) || 'pancake/';
  idPrefix += 'settings/';
  
  var settingsStore = store.Observable(new LocalStorage({
    idPrefix: idPrefix
  }));

  // settings is a dictionary of observable key=value
  var settingsMap = {}; 

  // overlay window.config properties
  lang.each(lang.defaults(defaultSettings, config || {}), function(val, key){
    updateEntry({ id: key, value: val });
  });

  // get an observed resultset from the store representing all settings
  var allSettings = settingsStore.query({ type: 'setting' });

  function updateEntry(entry) {
    // create/update observable settings values
    if(settingsMap[entry.id]) {
      settingsMap[entry.id](entry.value); 
    } else {
      settingsMap[entry.id] = new ko.observable(entry.value); 
    }
  }

  // initial population of the settings from the query result
  allSettings.forEach(updateEntry);

  allSettings.observe(function(entry, fromIndex, toIndex){
    if(toIndex === -1){
      // setting removed
      entry.value = undef;
    }
    updateEntry(details.object);
  }, true);

  // function onStorage(evt){
  //   console.log("Storage event: ", evt);
  // }
  // 
  // if (window.addEventListener) {
  //   window.addEventListener("storage", onStorage, false);
  // } else {
  //   window.attachEvent("onstorage", onStorage);
  // }

  return settingsMap;

});