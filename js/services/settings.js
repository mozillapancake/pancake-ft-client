define(['knockout', 'lang', 'store', 'lib/LsCacheStorage'], function(ko, lang, store, LocalStorage){
  
  var undef;
  var defaultSettings = {
    username: "guest"
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
  allSettings().forEach(updateEntry);

  // get notification of any changes
  allSettings.subscribe(function(settings, details){
    console.log("query update, ", entries, details);
    if(details && details.object) {
      updateEntry(details.object);
    }
  });

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