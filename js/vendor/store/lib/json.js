define(function(){
  var json = Object.create(JSON);
  json.fromJson = function(str){ return JSON.parse(str); }
  json.toJson = function(obj){ return JSON.stringify.apply(JSON, arguments); }
  return json;
});