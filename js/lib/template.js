/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['lang', 'logger', 'lib/url'], function(util, logger, Url){
  // simple compile templates
  // examples: 
  // var tmpl = template('To: {{name}}'), 
  //    str = tmpl({ name: 'Mally O'Mally <3\'s Mollie <mally@omally.com>' });
  //    str == "To: Mally O&#x27;Mally &lt;3&#x27;s Mollie &lt;mally@omally.com&gt;"

  // var tmpl = template('/{%base%}/{% author %}'), 
  //    str = tmpl({ base: 'library', author:'François d'Amboise (1550–1619)' });
  //    str == "/library/Fran%C3%A7ois%20d'Amboise%20(1550%E2%80%931619)"
  
  var tokenRe = /\{([\{%\?]?)([^%\}\?]+)([%\}\?]?)\}/g, 
      trimRe = /^\s*([\S\s]*?)\s*$/, 
      ampersandRe = /&/g, 
      ltRe = /</g, 
      gtRe = />/g,
      doubleQuoteRe = /"/g, 
      singleQuoteRe = /'/g, 
      forwardSlashRe = /\//g;
   
  var encodeQueryStringComponent = Url.encodeQueryStringComponent;
  
  function entityEscape(string) {
    // TODO: this is a pretty stupid - and slow - way to do single-character replacement in a string: fix it if it becomes an issue.
    return (''+string)
      .replace(ampersandRe, '&amp;')
      .replace(ltRe, '&lt;')
      .replace(gtRe, '&gt;')
      .replace(doubleQuoteRe, '&quot;')
      .replace(singleQuoteRe, '&#x27;')
      .replace(forwardSlashRe,'&#x2F;');
  }
  
   function template(tmpl) {
    return function(obj) {
      var getValue = ('function' == typeof obj.get) ? 
            util.bind(obj.get, obj) : function(name){ return obj[name]; };
      var hasValue = ('function' == typeof obj.has) ? 
            util.bind(obj.has, obj) : function(name){ return (name in obj); };
            
      return tmpl.replace(tokenRe, function(m, filter, name){
        name = name.replace(trimRe, '$1');
        if(! hasValue(name)){
          // TODO: here would be a good place to instrument for error logging
          logger.warn("Missing template property "+ name + " in data: ", obj, " from template: ", tmpl);
        }
        switch(filter){
          case '{': 
            // escape entities in the value 
            return entityEscape( getValue(name) ); 
          case '%': 
            // {% %} unlike underscore, the '%' filter means URI encode
            // Note that encodeURIComponent is *not* the right thing to do for querystrings. 
            // ... We may need to support {+ +} or something
            return encodeURIComponent( getValue(name) );
          case '?':
            /// x-www-form-urlencoded calls for '+' instead of %20 for spaces
            return encodeQueryStringComponent( getValue(name) );
          // case '??':
          //   /// full query-string encoding, so expect and preserve stuff like , + = &;
          default: 
            // e.g. template('amount: {sum}')({ sum: 12 }); as-is value insertion
            return getValue(name);
        }
      });
    };
  }
  template.replace = function(tmpl, values) {
    return template(tmpl)(values);
  };
  
  template.entityEscape = entityEscape;
  template.encodeQueryStringComponent = encodeQueryStringComponent;
  
  return template;
});
