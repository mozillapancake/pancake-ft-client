/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['underscore'], function (util) {

  var exports = {};
  var MISSING_FILENAME = '<unknown>', 
      MISSING_MODULE = '<unknown>',
      MISSING_FUNCTION = '<unknown>',
      MISSING_LINENO = '';

  var StackFrameProto = {
    'filename'  : MISSING_FILENAME,
    'module'    : MISSING_MODULE,
    'lineno'    : MISSING_LINENO,
    'function'  : MISSING_FUNCTION,
    'vars'      : {}
  };
  
  
  function mixin(obj, props){
    for(var p in props){
      obj[p] = props[p];
    }
    return obj;
  }
  function exclude(source, names){
    var obj = mixin({}, source);
    for(var i=0; i<names.length; i++){
      delete obj[names[i]];
    }
    return obj;
  }

  
  // Decorates a given function, making it an Error
  // constructor.
  var makeError = function (Ctor, name, props) {
    Ctor.prototype = new Error();
    Ctor.prototype.name = name;
    Ctor.prototype.constructor = Ctor;
    if(props){
      mixin(Ctor.prototype, props);
    }
    return Ctor;
  };

  function ExportableError(e, filename, lineno, ts){
    if(typeof e ==='string') {
      return new ExportableError( new Error(e, filename, lineno ));
    }
    this.type = e.name || 'Error';
    this.message = this.type + ': ' + e.message;
    this.fileName = filename || getFilenameFromError(e);
    this.timestamp = ts;
    this.lineNumber = ('undefined' == typeof lineno) ? getLineNumberFromError(e) || '': lineno;
    this.rawError = e;
    this.getTraceback();
    this.stacktrace = this.prepareStacktrace();
    if(this.traceback.length){
      if(this.fileName === MISSING_FILENAME) {
        this.fileName = this.traceback[0].filename;
      }
      if(this.lineNumber === MISSING_LINENO) {
        this.lineNumber = this.traceback[0].lineno;
      }
    }
    return this;
  }
  exports.ExportableError = ExportableError;

  ExportableError.prototype.prepare = function(){
    var message = this.message, 
        lineno = this.lineNumber;
    var label = lineno ? message + " at " + lineno : message;
    
    return {
      "message": label,
      "server_name": location.host,
      "culprit": this.fileName || location.href,
      "stacktrace": this.stacktrace,
      "exception": {
        "type": this.type,
        "value": message,
        "module": moduleFromFilename(this.fileName)
      },
      "site": this.site || null,
      "timestamp": this.timestamp
    };
    
  };
  
  ExportableError.prototype.getTraceback = function _getTracebackFromError(){
    var traceback = this.traceback, 
        fileurl = this.fileName;
    if(!traceback){
      var e = this.rawError;
      if (e['arguments'] && e.stack) {
        traceback = chromeTraceback(e);
      } else if (e.stack) {
        // Detect edge cases where Chrome doesn't have 'arguments'
        if (e.stack.indexOf('@') == -1) {
          traceback = chromeTraceback(e);
        } else {
          traceback = firefoxTraceback(e);
        }
      } else {
        traceback = [ util.defaults({
          "filename": fileurl, 
          "lineno": this.lineNumber, 
          "module":  moduleFromFilename(this.fileName)
        }, StackFrameProto) ];
        traceback = traceback.concat(otherTraceback(arguments.callee)); // best-effort, pass arguments.callee to exclude this fn from the stack
      }
    }
    // go looking through the trace to snip out this error handling code
    for(var i=0; i<traceback.length; i++){
      if(traceback[i]['function'] && traceback[i]['function'] == 'ExportableError'){
        break;
      }
    }
    // ditch all the stack frames up to and including the ExportableError ctor call
    if(i < traceback.length){
      traceback = traceback.slice(i+1);
    }
    
    this.traceback = traceback;
    return this.traceback;
  };
  
  ExportableError.prototype.prepareStacktrace = function _getStacktraceFromError() {
    var stacktrace, 
        fileurl = this.fileName,
        lineno = ''+this.lineNumber,
        traceback = this.getTraceback();

    if (traceback && traceback.length) {
      stacktrace = {"frames": traceback};
      if(!fileurl){
        fileurl = traceback[0].filename;
      } 
    } else if (fileurl) {
      stacktrace = {
        "frames": [util.defaults({
          "filename": fileurl,
          "lineno": lineno,
          "module": errors.moduleFromFilename(fileurl)
        }, StackFrameProto)]
      };
    }
    // normalize line numbers as strings
    stacktrace.frames.forEach(function(frame){
      frame.lineno = ''+frame.lineno;
    });
    return stacktrace;
  };
  
  var funcNameRE = /function\s*([\w\-$]+)?\s*\(/i;

  function moduleFromFilename(fileurl){
    // stop-gap thing to get a module id from a filename/url.
    var rootIdx = fileurl.indexOf('js/');
    return (rootIdx > -1) ?
        fileurl.substring(rootIdx+'js/'.length).replace(/\.js[^\.]*$/, '') :
        fileurl;
  }

  function getLineNumberFromError(e){
    return e.line || e.lineNumber;      // Webkit || Mozilla
  }

  function getFilenameFromError(e){
    return e.sourceURL ||  // Webkit
        e.fileName     ||  // Mozilla
        MISSING_FILENAME;  // Sometimes Safari
  }

  function trimString(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }

  function chromeTraceback(e) {
    /*
     * First line is simply the repeated message:
     *   ReferenceError: aldfjalksdjf is not defined
     *
     * Following lines contain error context:
     *   at http://localhost:9000/1/group/306:41:5
     */
    var chunks, fn, filename, lineno,
      traceback = [],
      lines = e.stack.split('\n');

    lines.slice(1).forEach(function(line, i) {
      // Trim the 'at ' from the beginning, and split by spaces
      chunks = trimString(line).slice(3);
      if (chunks == "unknown source") {
        return;  // Skip this one
      } else {
        chunks = chunks.split(' ');
      }

      if (chunks.length > 2) {
        // If there are more than 2 chunks, there are spaces in the
        // filename
        fn = chunks[0];
        filename = chunks.slice(1).join(' ');
        lineno = '(unknown)';
      } else if (chunks.length == 2) {
        // If there are two chunks, the first one is the function name
        fn = chunks[0];
        filename = chunks[1];
      } else {
        fn = '(unknown)';
        filename = chunks[0];
      }

      if (filename && filename != '(unknown source)') {
        if (filename.slice(0, 1) == '(') {
          // Remove parentheses
          filename = filename.slice(1, -1).split(':');
        } else {
          filename = filename.split(':');
        }

        lineno = filename.slice(-2)[0];
        filename = filename.slice(0, -2).join(':');
      }

      traceback.push(util.defaults({
        'function': fn,
        'filename': filename,
        'lineno': lineno
      }, StackFrameProto));
    });
    return traceback;
  }

  function firefoxTraceback(e) {
    /*
     * Each line is a function with args and a filename, separated by an ampersand.
     *   unsubstantiatedClaim("I am Batman")@http://raven-js.com/test/exception.js:7
     *
     * Anonymous functions are presented without a name, but including args.
     *   (66)@http://raven-js.com/test/vendor/qunit.js:418
     *
     */
    var chunks, fn, args, filename, lineno, module,
      traceback = [],
      stackstr = e.stack,
      rawLines = e.stack.split('\n'), 
      rawLine,
      lines = [],
      line,
      state = 'start',
      lineEndsEntry = false, 
      reEntryEnd = (/@(\S+):(\d+)$/),
      lineTokensMatch;
    
    while(rawLines.length){
      rawLine = rawLines.shift();
      // can we find the line-end marker on this line?
      lineEndsEntry = reEntryEnd.test(rawLine);
      switch(state){
        case 'start': 
        // if this is a new entry, just add it to our lines array
          lines.push(rawLine);
          break;
        case 'continuation': 
        // if this continues the previous entry, concat it
          lines[lines.length-1] += '\n' + rawLine;
      }
      state = lineEndsEntry ? 'start' : 'continuation';
      lineEndsEntry = false;
    }
    
    lines.forEach(function(line, i) {
      if (line) {
        
        // @http://colin.local:6543/js/lib/errors.js?r={{v}}:370        
        chunks = reEntryEnd.exec(line) || [];
        chunks[0] =RegExp.leftContext; // replace the regexp matched-string with everything up to the match
        if (chunks[0]) {
          fn = chunks[0].split('(');

          if (fn[1] != ')') {
            args = fn[1].slice(0, -1).split(',');
          } else {
            args = undefined;
          }

          if (fn[0]) {
            fn = fn[0];
          } else {
            fn = '(unknown)';
          }
        } else {
          fn = '(unknown)';
        }

        filename = chunks[1];
        lineno = chunks[2];
        module = moduleFromFilename(filename);
        traceback.push( util.defaults({
          'function': fn,
          'filename': filename,
          'module': module,
          'lineno': lineno,
          'vars': {'arguments': args}
        }, StackFrameProto) );
      }
    });
    return traceback;
  }

  function otherTraceback(callee) {
    /*
     * Generates best-efforts tracebacks for other browsers, such as Safari
     * or IE.
     */
    var fn, args,
      ANON = '<anonymous>',
      traceback = [],
      max = 9;
    while (callee && traceback.length < max) {
      fn = callee.name || (funcNameRE.test(callee.toString()) ? RegExp.$1 || ANON : ANON);
      if (callee['arguments']) {
        args = stringifyArguments(callee['arguments']);
      } else {
        args = undefined;
      }
      traceback.push( util.defaults({
        'function': fn,
        'post_context': callee.toString().split('\n'),
        'vars': {'arguments': args}
      }, StackFrameProto) );
      callee = callee.caller;
    }
    return traceback;
  }

  function stringifyArguments(args) {
    /*
     * Converts a callee's arguments to strings
     */
    var fn,
      UNKNOWN = '<unknown>',
      results = [];

    util.each(args, function(arg, i) {
      if (arg === undefined) {
        results.push('undefined');
      } else if (arg === null) {
        results.push('null');
      } else if (arg instanceof Array) {
        results.push(stringifyArguments(arg));
      } else if (arg.constructor) {
        fn = arg.constructor.name || (funcNameRE.test(arg.constructor.toString()) ? RegExp.$1 || UNKNOWN : UNKNOWN);
        if (fn == 'String') {
          results.push('"' + arg + '"');
        } else if (fn == 'Number' || fn == 'Date') {
          results.push(arg);
        } else if (fn == 'Boolean') {
          results.push(arg ? 'true' : 'false');
        } else {
          results.push(fn);
        }
      } else {
        results.push(UNKNOWN);
      }
    });

    return results;
  }

  // var Error = function(message, fileName, lineNumber) {
  //   this.message = message;
  // }
  // Error.prototype.valueOf = function(){ return this.name +": " + this.message; } 
  // 

  function KeysMissingError(message, keys, fileName, lineNumber) {
    var args =  [message].concat(Array.prototype.slice.call(arguments, 2));
    if(Error.captureStackTrace){
      Error.captureStackTrace(this, KeysMissingError);
    }
    this.missing = keys || [];
    if(message) this.message = message;
    if(fileName) this.fileName = fileName;
    if(lineNumber) this.lineNumber = lineNumber;
    if(this.missing.length) 
      this.message += ": " + this.missing.join(", ");
    return this;
  }
  exports.KeysMissingError = makeError(KeysMissingError, 'KeysMissingError', {message: 'Missing required keys'});

  function IdMissingError(message, id, fileName, lineNumber) {
    var args =  [message].concat(Array.prototype.slice.call(arguments, 2));
    if(Error.captureStackTrace){
      Error.captureStackTrace(this, IdMissingError);
    } else {
      var tmpError = new Error();
    }
    this.identifier = id;
    if(message) this.message = message;
    if(fileName) this.fileName = fileName;
    if(lineNumber) this.lineNumber = lineNumber;
    return this;
  }
  exports.IdMissingError = makeError(IdMissingError, 'IdMissingError', { message:'ID is required' });

  function IdDoesNotExistError(message, id, fileName, lineNumber) {
    var args =  [message].concat(Array.prototype.slice.call(arguments, 2));
    if(Error.captureStackTrace){
      Error.captureStackTrace(this, IdDoesNotExistError);
    }
    this.identifier = id;
    if(message) this.message = message;
    if(fileName) this.fileName = fileName;
    if(lineNumber) this.lineNumber = lineNumber;
    return this;
  }
  exports.IdDoesNotExistError = makeError(IdDoesNotExistError, 'IdDoesNotExistError', {message: 'No match for ID given'});
  
  function CancelledError(message, fileName, lineNumber) {
    if(message) this.message = message;
    if(fileName) this.fileName = fileName;
    if(lineNumber) this.lineNumber = lineNumber;
    return this;
  }
  exports.CancelledError = makeError(CancelledError, 'CancelledError', {message: 'Cancelled'});
  
  return exports;
});
