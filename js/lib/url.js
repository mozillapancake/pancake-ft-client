/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(function(){
  function isEmpty(thing){
    if('object' !== typeof thing) return true; // non-object thing
    if(!thing) return true; // falsy thing (empty string, null/false)
    if(thing instanceof Array) return !!thing.length; // empty array
    for(var i in thing){ // empty object
      return false;
    }
    return true;
  };
  
  // TODO: could cache parsed urls
  // var cache = {};

  var Url = function(url, baseUrl){
    if(typeof url === 'string'){
      this._url = url;
      url = parse.apply(null, arguments);
    } 
    if(typeof url === 'object'){
      for(var i in url){
        this[i] = url[i];
      }
    }
    return this;
  };
  
  var
    ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"),
    ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$");

  function parse(urlstr, baseUrl){

    var n = null,
      _a = arguments,
      uri = [_a[0]];
    // resolve uri components relative to each other
    for(var i = 1; i<_a.length; i++){
      if(!_a[i]){ continue; }

      // Safari doesn't support this.constructor so we have to be explicit
      // FIXME: Tracked (and fixed) in Webkit bug 3537.
      //    http://bugs.webkit.org/show_bug.cgi?id=3537
      var relobj = parse(_a[i]+""),
        uriobj = parse(uri[0]+"");

      if(
        relobj.path == "" &&
        !relobj.scheme &&
        !relobj.authority &&
        !relobj.querystring
      ){
        if(relobj.fragment != n){
          uriobj.fragment = relobj.fragment;
        }
        relobj = uriobj;
      }else if(!relobj.scheme){
        relobj.scheme = uriobj.scheme;

        if(!relobj.authority){
          relobj.authority = uriobj.authority;

          if(relobj.path.charAt(0) != "/"){
            var path = uriobj.path.substring(0,
              uriobj.path.lastIndexOf("/") + 1) + relobj.path;

            var segs = path.split("/");
            for(var j = 0; j < segs.length; j++){
              if(segs[j] == "."){
                // flatten "./" references
                if(j == segs.length - 1){
                  segs[j] = "";
                }else{
                  segs.splice(j, 1);
                  j--;
                }
              }else if(j > 0 && !(j == 1 && segs[0] == "") &&
                segs[j] == ".." && segs[j-1] != ".."){
                // flatten "../" references
                if(j == (segs.length - 1)){
                  segs.splice(j, 1);
                  segs[j - 1] = "";
                }else{
                  segs.splice(j - 1, 2);
                  j -= 2;
                }
              }
            }
            relobj.path = segs.join("/");
          }
        }
      }

      uri = [];
      if(relobj.scheme){
        uri.push(relobj.scheme, ":");
      }
      if(relobj.authority){
        uri.push("//", relobj.authority);
      }
      uri.push(relobj.path);
      if(relobj.querystring){
        uri.push("?", relobj.querystring);
      }
      if(relobj.fragment){
        uri.push("#", relobj.fragment);
      }
    }

    var strUri = uri.join(""), 
        url = {};

    // break the uri into its main components
    var r = strUri.match(ore);

    url.scheme = r[2] || (r[1] ? "" : n);
    url.authority = r[4] || (r[3] ? "" : n);
    url.path = r[5]; // can never be undefined
    url.querystring = r[7] || (r[6] ? "" : n);
    url.query = queryToObject(url.querystring);
    url.fragment   = r[9] || (r[8] ? "" : n);

    if(url.authority != n){
      // server based naming authority
      r = url.authority.match(ire);

      url.user = r[3] || n;
      url.password = r[4] || n;
      url.hostname = r[6] || r[7]; // ipv6 || ipv4
      url.port = r[9] || n;
      url.host = url.hostname + ( url.port ? ':' +url.port : '' );
    }
    return url;
  };
  
  Url.parse = function(url, baseurl) {
    return new Url(url, baseurl);
  };
  
  Url.parseForUrls = function(urlstr){
    var matches = [], 
        match = null, 
        url = '',
        rePossibleUrlsRe = /(([\w]{3,}):\/\/\S+)|(\S+\.\S{2,})/g;
        // rePossibleUrlsRe = /(([\w]{3,}):\/\/)?([^\s\.\/]+\.)+[\w]{2,}(:\d+)?(\/?\S+)*/g;
    while((match = rePossibleUrlsRe.exec( urlstr ))){
      // trim off trailing punctuation
      url = match[0].replace(/[,.]$/, '');
      matches.push({ title: url, url: url, scheme: match[1] });
    }
    matches.forEach(function(props){
      props.Url = props.scheme ? new Url(props.url) : new Url('http://'+props.url);
      props.url = props.Url.toString();
      delete props.scheme;
    });
    return matches;
  };

  Url.prototype._toPartsArray = function(baseUrl){
    var parts = [], url = this; 
    if(url.scheme) parts.push(url.scheme + '://');
    if(url.hostname && url.port) {
      parts.push(url.hostname + ':' + url.port);
    } else {
      parts.push(url.host);
    }
    if(url.path) parts.push(url.path);
    if(!isEmpty(url.query)) parts.push('?' + Url.objectToQuery(url.query));
    if(url.fragment) parts.push('#' + url.fragment);
    return parts;
  };
  
  Url.prototype.toString = function(){
    var parts = this._toPartsArray();
    return parts.join('');
  };

  Url.prototype.toRelativeString = function(baseUrl){
    if('string' == typeof baseUrl) baseUrl = new Url(baseUrl);
    var isDifferent = false;

    // only include a part if it differs from the base url
    if(url.scheme &&  url.scheme !== baseUrl.scheme) {
      parts.push(url.scheme + '://');
      isDifferent = true;
    }
    if(url.hostname && url.hostname !== baseUrl.hostname) parts.push(url.hostname);
    if(url.port && url.port !== baseUrl.port) parts.push(':' + url.port );
    if(url.path && url.path !== baseUrl.path) parts.push(url.path);
    // the rest are added regardless
    if(!isEmpty(url.query)) parts.push('?' + Url.objectToQuery(url.query));
    if(url.fragment) parts.push('#' + url.fragment);
  };
  
  function queryToObject(queryStr) {
    var pairs, nameValue, params = {}, val;
    if(queryStr){
      pairs = queryStr.split('&');
      for(var i=0; i<pairs.length; i++) {
        nameValue = pairs[i].split('=').map(decodeQueryStringComponent);
        val = nameValue[1];
        if(val){
          // looks like a bool
          if(val.match(/false|true/i)){
            val = (/true/i).test(val);
          } 
          // looks like a number
          else if(val.match(/^\d+$/i)){
            val = Number(val);
          }
        }
        params[ nameValue[0] ] = val;
      }
    }
    return params;
  }

  function objectToQuery(obj){
    var querystr = '', 
        delim = ''; // only prepend '&' after the first pair
    for(var name in obj){
      querystr +=  delim + Url.encodeQueryStringComponent(name);
      if(obj[name] !== undefined && obj[name] !== null){
         querystr += '=' + Url.encodeQueryStringComponent(obj[name]);
      }
      delim = '&';
    }
    return querystr;
  }

  function encodeQueryStringComponent(str){
    // high-score of 10% => high-score+of+10%25
    var words = str.toString().split(' ');
    words = words.map(encodeURIComponent);
    // unencode '|' chars, we like those as-is
    words = words.map(function(word){
      return word.replace(/%7C/g, '|');
    });
    return words.join('+');
  }
  function decodeQueryStringComponent(str){
    // sanitize partial percent-encoded string fragments, otherwise we get malformed URI exceptions from decodeURIComponent
    str = str.toString().replace(/%([^0-9]+|$)$/g, '');
    var words = str.split('+');
    words = words.map(decodeURIComponent);
    return words.join(' ');
  }

  Url.encodeQueryStringComponent = encodeQueryStringComponent;
  Url.decodeQueryStringComponent = decodeQueryStringComponent;
  Url.queryToObject = queryToObject;
  Url.objectToQuery = objectToQuery;
  
  return Url;
});
