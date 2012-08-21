define(function(){
  // UTC-adjusted timestamp (milliseconds since epoch)
  var SECONDS = 1000, MINUTES= SECONDS*60;
  function timestamp(now, offsetMinutes){
    var offsetMillis = offsetMinutes ? offsetMinutes : new Date().getTimezoneOffset()*MINUTES;
    return (now || Date.now())+offsetMillis;
  }
  return timestamp;
});