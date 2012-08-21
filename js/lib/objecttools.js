/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'underscore',
  'lib/errors'
], function (
  util,
  errors
) {
  
  var exports = {};
  var hasOwn = Object.prototype.hasOwnProperty;

  // Define a helper for translating object keys, changing their names.
  // This is useful for parsing JSON responses into new formats.
  // Translations object should be in format: `{ OLD_KEY: NEW_KEY }`.  
  var translate = exports.translate = function (translations, obj) {
    var newKey, oldKey;
    for (oldKey in obj) {
      newKey = translations[oldKey];
      // If there is no translation for this key, we can
      // skip this iteration of the loop.
      // 
      // Also, make sure the new and old key aren't the same
      // key. If we don't check it,
      // we could end up deleting the property unintentionally!
      if (!newKey || newKey === oldKey) continue;
      
      // Set value on new key.
      obj[newKey] = obj[oldKey];
      // Delete old key from object.
      delete obj[oldKey];
    }
    return obj;
  };

  // Restrict the keys in an object to the provided array of key names.
  // Modifies the original object, throwing away any properties not in the keys.
  var restrict = exports.restrict = function (keys, obj) {
    for (var key in obj) {
      if (util.indexOf(keys, key) !== -1) continue;
      delete obj[key];
    }
    return obj;
  };
  
  // Get the value of an property in an object
  // optionally using a dot-path ('some.deep.object')
  var lookup = exports.lookup = function (obj, path){
    var parts = path.split('.'), pname;
    while((pname = parts.shift())) obj = obj[pname];
    return obj;
  };
  
  var set = exports.set = function(name, value, context){
    var parts = name.split("."), p = parts.pop(), obj = getProp(parts, true, context);
    return obj && p ? (obj[p] = value) : undefined; // Object
  };
  
  // Check for missing values given any number of keys.
  var missing = exports.missing = function (obj, keys){
    // get a list of all required dictionary keys *not* defined in obj.
    return util.filter(keys, function (key) {
      return 'undefined' == typeof lookup(obj, key);
    });
  };

  // Require keys given in `required`. Throw an error if any are missing.
  // Restrict keys on an object to the array of keys given in `allowed`.
  exports.restrictAndRequire = function (required, allowed, obj) {
    // Create a shallow copy of the object to prevent side-effects.
    obj = util.clone(obj);
    var missingKeys = missing(obj, required);
    if (missingKeys.length) throw new errors.KeysMissingError(null, missingKeys);
    restrict(allowed, obj);
    return obj;
  };

  // test a obj to see if its a window
  var isWindow = exports.isWindow = function(obj){
    return obj && typeof obj === "object" && "setInterval" in obj;
  };
  
  // test a obj to see if its plain Object
  var isPlainObject = exports.isPlainObject = function(obj){
    if ( !obj || typeof obj !== "object" || obj.nodeType || isWindow( obj ) ) {
      return false;
    }

    try {
      // Not own constructor property must be Object
      if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
  };

  // get a more useful typeof string for a thing
  var getType = exports.getType = function(thing) {
    var t = typeof thing;
    if('undefined' == t) return 'undefined';
    if(null === thing) return 'null';
    if('object' === t) {
      if(thing instanceof Array) return 'array';
      if( isWindow(thing) ) return 'window';
      if(thing instanceof Date) return 'date';
      if(thing instanceof RegExp) return 'regexp';
      if(thing.nodeType) return 'domnode';
      if(thing instanceof Error || (('message' in thing) && (('lineno' in thing) || ('lineNumber' in thing)))){
        return 'error';
      }
      return isPlainObject(thing) ? 'object' : 'unknown';
    } else {
      return t;
    }
  };

  // get JSON for error-like objects (should work for ErrorEvents)
  var serializeError = exports.serializeError = function(obj){
    obj = obj || null;
    return JSON.stringify({
      'message': obj.message,
      'name': obj.name,
      'details': obj.details || '', // our custom errors from lib/errors provide a details object
      'filename': obj.filename || obj.fileName,
      'lineno': obj.lineno || obj.lineNumber
    });
  };
  
  var objectMemberTypes = exports.objectMemberTypes = function(obj){
    obj = obj || {};
    var output = {};
    for(var key in obj){
      output[key] = getType(obj[key]);
    }
    return JSON.stringify(output);
  };

  // get JSON for arbitrary objects including some that JSON.stringify might gag on
  var serializeObject = exports.serializeObject = function(obj, depth) {
    // not exhaustive, but catches a couple of things that might befuddle JSON.stringify
    depth = depth || 0;
    var type = getType(obj), 
        indent = new Array(depth+1).join('  '),  // 2-space indent * depth
        str = '', count = -1;
        
    switch(type){
      case 'date': return obj.toString();
      case 'regexp': return '/'+obj.source+'/';
      case 'array': 
        str = '['; 
        count = 0;
        for(; count < obj.length; count++){
          str += (count) ? ',\n' : '\n';
          str += indent + '  ' + serializeObject(obj[count], depth+1);
        }
        str += '\n' + indent + ']';
        return str;
      case 'error':   // return serializeError(obj);
      case 'object': 
        str = '{';
        count = 0;
        for(var i in obj){
          str += (count) ? ',\n' : '\n';
          str += indent + '  ' + i + ': ' + serializeObject(obj[i], depth+1);
          count++;
        }
        str += '\n' + indent + '}';
        return str;
      case 'undefined': return JSON.stringify(null);
      default: return JSON.stringify(obj, null, 2);
    }
  };

  return exports;
});
