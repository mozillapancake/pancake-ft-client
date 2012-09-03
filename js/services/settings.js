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

  // function onStorage(evt){
  //   console.log("Storage event: ", evt);
  // }
  // 
  // if (window.addEventListener) {
  //   window.addEventListener("storage", onStorage, false);
  // } else {
  //   window.attachEvent("onstorage", onStorage);
  // }
  
  var settingsQuery = settingsStore.query({ type: 'setting' });
  var settingsMap = {}; 

  function populateSettingsMap(entries) {
    entries.forEach(function(entry){
      settingsMap[entry.id] = entry.value;
    });
    console.log("populateSettings, entries: ", entries, "settingsMap: ", settingsMap);
  }
  function update(entries, details) {
    // a change in the underlying store is mapped into the observed settingsMap dictionary
    console.log("update, ", entries, details);
    if(details && details.object) {
      var id = details.object.id; 
      settingsMap[id] = details.object.value;
    }
    observedSettings.valueHasMutated();
  }

  // seeds the settings from results from localStorage
  populateSettingsMap(settingsQuery());
  
  // fill in gaps from defaultSettings
  lang.defaults(settingsMap, defaultSettings);
  
  // overlay window.config properties
  lang.extend(settingsMap, config || {});

  // return value will be an observed dictionary value
  var observedSettings = ko.observable(settingsMap);

  // settings are backed by entries in a localStorage-backed data store (which features synchronous query)
  settingsQuery.subscribe(update);

  var cache = {};
  var settings = {
    value: function(key) {
      return cache[key] || (cache[key] = ko.computed({
        read: function(){
          return observedSettings()[key]; 
        },
        write: function(value) {
          var overwrite = true;
          var setting = settingsStore.get(key);
          if(undef === setting || null === setting) {
            // create new setting
             setting = { type: 'setting', id: key, value: value };
             overwrite = false;
          } else if(value === setting.value) {
            // no change
            return key;
          }
          // update the value property and save the change into the store
          setting.value = value;
          console.log("PUTing setting: ", setting);
          return settingsStore.put(setting, { overwrite: overwrite });
        }
      }))
    }
  };

  return settings;

});