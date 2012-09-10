define(['lang', 'knockout'], function(util, ko){

  function isObservableArray(thing) {
    return (
      'function' === typeof thing.valueWillMutate &&
      'function' === typeof thing &&
      (thing() instanceof Array)
    );
  }


  ko.extenders.wireTo = function(target, method) {
    // target is the original observable array
    var eventSink = {
      ondata: function(data, details){
        // update viewmodel from data event
        console.log("data event from stream: ", data, details);
        if(this.paused) return;

        var underlyingArray = target();
        if(details) {
          // handle partial collection update
          target.valueWillMutate();
          if(details.fromIndex > -1) {
            // remove it
            underlyingArray.splice(details.fromIndex, 1);
          }
          if(details.toIndex > -1) {
            // insert it
            underlyingArray.splice(details.toIndex, 1, data);
          }
          console.log("underlying array: ", underlyingArray);
          target.valueHasMutated();
        } else {
          // simplest case handling: remove everything, inject the new
          target.removeAll();
          var spliceArgs = [0, 0].concat(data); 
          target.splice.apply(target, spliceArgs);
        }
      },
      pause: function(){
        this.paused = true;
      },  
      resume: function(){
        this.paused = false;
      }
    };
    method(eventSink);
    return target;
  }

  return ko.extenders.wireTo;
})