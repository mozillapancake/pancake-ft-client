define(function(){
  Pancake = {};

  Pancake.openApplicationView = function(url){
    console.log("Open %s in application view", url);
    window.open(url, 'appviewer');
  };

  Pancake.openPublicView = function(url){
    console.log("Open %s in public viewer", url);
    window.open(url, 'publicviewer');
  };
  
  Pancake.open = function(url){
    location.assign(url);
  };
  
  return Pancake;
});