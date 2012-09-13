define(function(){
  Pancake = {};
  Pancake.openApplicationView = function(url){
    window.open(url, 'viewer');
  };
  
  return Pancake;
});