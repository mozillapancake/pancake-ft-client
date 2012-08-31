define(['lang', 'knockout'], function(lang, ko){

  function isObservableArray(thing) {
    return (
      'function' === typeof thing.valueWillMutate &&
      'function' === typeof thing &&
      (thing() instanceof Array)
    );
  }

  ko.extenders.composeWith = function(target, functions) {
    // target is the original observable array
    // console.log("composeWith, got target: ", target());
    
    // create the observable we'll return and update with the result of the reduce
    var placeholder = ko.observable('');
    // console.log("declared placeholder");
    
    // take a copy so we don't change the original ref, which might be reused elsewhere
    functions = functions.slice(0);
    // underscore's compose calls our functions in reverse order
    // me personally, I prefer a left-right chain so its like value = ar.map(fn).map(fn2).map(n3);
    functions.reverse(); 
    
    var composedHandler = lang.compose.apply(lang, functions);
    
    function onTargetChange(values){
      // console.log("event on original observable target array, arguments are: ", values, " this: ", this);
      
      if(ko.isObservable(values)) {
        // console.log("onTargetChange subscriber was passed an observable");
        values = values();
      }

      if('function' !== typeof values.reduce){
        values = [values];
      }
      // console.log("are these values themselves observables? ", !!values.filter(ko.isObservable));

      // unwrap each observable value
      var unwrapped = values.map(function(value){
        return ko.isObservable(value) ? ko.utils.unwrapObservable(value) : value;
      });
      
      var results = composedHandler(unwrapped);
      placeholder(results);
      return results;
    }

    // get the initial values in the placeholder
    placeholder(onTargetChange( target() ));
    // hook into future changes
    target.subscribe(onTargetChange);
    
    return placeholder;
  };
  
  return ko.extenders.composeWith;
})