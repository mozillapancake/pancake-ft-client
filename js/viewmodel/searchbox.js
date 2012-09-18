define(['knockout'], function(ko){
  var searchBox = {
    value:   ko.observable(''),  // real-time values
    // Define handlers for cut/paste actions, which may not fire the key-handling events
    onsearchpaste: function (bindContext, evt) {
      console.log("search input paste");
      setTimeout(function(){
        searchBox.value( evt.target.value );
      },0);
      return true;
    },
    onsearchcut: function (bindContext, evt) {
      console.log("search input cut");
      setTimeout(function(){
        searchBox.value( evt.target.value );
      },0);
      return true;
    },
    // Define implicit handler for search box typing.
    onsearchkeyup: function (bindContext, evt) {
      console.log("keyup: ", evt.keyCode, evt.target.value);
      if (evt.keyCode == 13) {
      } else {
        searchBox.value( evt.target.value );
      }
    }
  };
  return searchBox;
  
});

