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
    session: ""
  };
  var globalConfig = config || {};
  var combinedSettings = lang.extend({}, storedSettings, globalConfig);
  
  var idPrefix = (config && config.localStorageIdPrefix) || 'pancake/';
  idPrefix += 'settings';
  
  var updateNotifier = new EventEmitter();
  // updateNotifier.addListener('change', function(key, value, oldValue){
  //   // sync value with the storedSettings
  //   settingsStore.put({
  //     id: key, value: value
  //   });
  //   console.log("Observable setting value changed: ", key, value, oldValue);
  // });
  
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
    put: function(object, options){
      options = options || {};
      var key = object.id || object.key; 
      if(key in storedSettings){
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
    if(
      // ignore unrelated keys
       evt.key.indexOf( idPrefix) > -1 &&
       evt.key.indexOf( '__lscachetest__') == -1 &&
       // ignore metadata updates
       evt.key.indexOf( '-cacheexpiration') == -1       && 
       // lscache sets to null before setting actual value
       evt.newValue !== null     
    ) {
      // trigger observable notifications for this value
      console.log("Storage event from elsewhere: ", evt.key, evt.newValue, sourceUrl);
      var observable = settingsStore[evt.key];
      if(observable && observable.valueHasMutated) {
        // FIXME: maybe distinguish somehow between event source in eventname?
        observable(newValue);
      }
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