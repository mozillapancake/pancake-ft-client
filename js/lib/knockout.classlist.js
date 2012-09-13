define(['knockout'], function(ko){
  ko.bindingHandlers['classlist'] = {
      'update': function (element, valueAccessor) {
          var classes = ko.utils.unwrapObservable(valueAccessor()), 
              cls;
          if (typeof value == "string") {
            classes = string.split(/,\s*/);
          }
          while((cls = classes.shift())){
            cls = String(cls || ''); // Make sure we don't try to store or set a non-string value
            if(cls && !element.classList.contains(cls)){
              element.classList.add(cls);
            }
          }
          console.log(element.classList);
      }
  };
  
});