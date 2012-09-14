define([
  'lang', 
  'EventEmitter', 
  'compose', 
  'knockout', 
  'store', 
  'lscache', 
  'lib/LsCacheStorage'],
function(
  lang, 
  EventEmitter, 
  Compose, 
  ko, 
  store, 
  lscache, 
  LocalStorage
){
  var undef;
  var storedSettings = {
    username: "guest",
    session: 0
  };
  var globalConfig = config || {};
  var combinedSettings = lang.extend({}, storedSettings, globalConfig);
  
  var idPrefix = (config && config.localStorageIdPrefix) || 'pancake/';
  idPrefix += 'settings/';
  
  var updateNotifier = new EventEmitter();
  updateNotifier.addListener('change', function(key, value, oldValue){
    // sync value with the storedSettings
    settingsStore.put({
      id: key, value: value
    });
    console.log("Observable setting value changed: ", key, value, oldValue);
  });
  
  // internal store to normalize setting value access
  //  some settings are localStorage-backed (see storedSettings), others not.
  var settingsStore = Compose.create(Compose, {
    // prototype
    defaultExpiry: 15,
    get: function(key) {
      lscache.setBucket(idPrefix);
      var value;
      if(key in storedSettings){
        value = lscache.get(key);
      }
      // fall back to defaults and/or config props
      if(null === value || undef === value) {
        value = combinedSettings[key];
      }
      return value;
    },
    reset: function(){
      // reset to defaults, wiping out localStorage values
      lscache.setBucket(idPrefix);
      lscache.flush();
      
      // TODO: seems like some settings might be good forever (or a month, say)
      // whereas others should expire quickly
      var expireMinutes = 2; // Minutes
      Object.keys(storedSettings).forEach(function(key){
        lscache.set(key, storedSettings[key], expireMinutes);
      });
    },
    refresh: function(){
      // re-populate settings from localStorage
      lscache.setBucket(idPrefix);
      Object.keys(storedSettings).forEach(function(key){
        var value = lscache.get(key);
        console.log("refresh, setting observable value: ", key, value);
        this[key](value);
      }, this);
    },
    put: function(object, options){
      options = options || {};
      var key = object.id || object.key; 
      var currentValue;
      if(key in storedSettings){
        currentValue = lscache.get(key);
        // Avoid noisy write notifications when the value is actually the same
        // Note we can't just test object.value == currentValue because it could be an object
        // TODO: move this into lscache where it gets stringified again?
        if(JSON.stringify(currentValue) == JSON.stringify(object.value)){
          // no change in value;
          return;
        }
        lscache.setBucket(idPrefix);
        lscache.set(key, object.value, options.expiry || this.defaultExpiry);
      } else {
        this[key] = object.value;
      }
      return key;
    },
    add: function(object, options){
      options = options || options;
      if(this.get(object.id)){
        throw new Error("Object already exists");
      }
      return this.put(object, options);
    },
    registerSetting: function(key, value, options){
      if('function' === typeof this[key]) {
        throw "Cant register setting: " + key + " over existing function";
      }
      var initialValue = this.get(key);
      var observable = this[key] = ko.observable( initialValue );
  
      var subscription = observable.subscribe(function(newValue){
        updateNotifier.emitEvent('change', [key, newValue, value]);
        // updateNotifier.emitEvent('change-'+key, [newValue, value]);
      });
      // stash subscription so we could clean up later
      this._subscriptions[key] = subscription;
    }
  }, function(){
    // init
    // turn each property into an observable
    this._subscriptions = {};
    lang.each(combinedSettings, function(value, key){
      this.registerSetting(key, value, {});
    }, this);
  });
  
  function onStorage(evt){
    var sourceUrl = evt.url || evt.uri;
    // is the event worthy of our attention? 
    console.log("Storage event from elsewhere: ", evt.key, evt.newValue, sourceUrl);
    if(
      // ignore unrelated keys
       evt.key.indexOf( idPrefix) > -1 &&
       evt.key.indexOf( '__lscachetest__') == -1 &&
       // ignore metadata updates
       evt.key.indexOf( '-cacheexpiration') == -1       && 
       // lscache sets to null before setting actual value
       evt.newValue !== null     
    ) {
      // trigger a refresh, we don't seem to be getting 1:1 storage events to storage writes
      console.log("calling settingsStore.refresh");
      settingsStore.refresh();
    }
  }
  // 
  if (window.addEventListener) {
    window.addEventListener("storage", onStorage, false);
  } else {
    window.attachEvent("onstorage", onStorage);
  }

  return settingsStore;

});