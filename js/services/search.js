define([
  'dollar', 
  'compose', 
  'services/core', 
  'knockout'
], function(
  $, 
  Compose, 
  services, 
  ko
){

  function dataToViewModel(data){
    // util.defaults(data, proto);
    // FIXME: ko.mapping is not defined? 
    // var viewModel = ko.mapping.fromJS(data);
    var viewModel = data;
    return viewModel;
  }

  function successHandler(rows) {
    return function(results){
      if('string' == typeof results) {
        results = JSON.parse(results);
      }
      var len = ('function' == typeof rows) ? rows().length : rows.length;
      // rows is observable, so splice triggers updates in any bindings
      rows.splice.apply(
        rows, 
        [0, len].concat( results.map( dataToViewModel ) )
      );
    };
  }
  
  services.search = Compose.create(services.search || {}, {
    yourResults: function(query, options){
      options = options || {};
      var self = this;
      var rows = options.rows || ko.observableArray([]);
      
      // we return the observable array, but call splice on it with the results when the come back
      // as its observable, it should result in updates to all listeners
      // need to align ko observables with store observables
      
      // placeholder: the store will do this eventually, this method will just be sugar
      $.ajax({
        url: '/search/byuser',
        cache: false,
        type: 'GET',
        success: successHandler(rows),
        error: function(err){
          console.warn("Error fetching yourResults: ", err);
        }
      });
      
      return rows;
    }, 
    theirResults: function(query, options){
      options = options || {};
      var self = this;
      var rows = options.rows || ko.observableArray([]);
      
      // we return the observable array, but call splice on it with the results when the come back
      // as its observable, it should result in updates to all listeners
      // need to align ko observables with store observables
      
      $.ajax({
        url: '/search/others',
        cache: false,
        type: 'GET',
        success: successHandler(rows),
        error: function(err){
          console.warn("Error fetching theirResults: ", err);
        }
      });
      
      return rows;
    },
    webResults: function(query, options){
      options = options || {};
      var self = this;
      var rows = options.rows || ko.observableArray([]);
      
      // we return the observable array, but call splice on it with the results when the come back
      // as its observable, it should result in updates to all listeners
      // need to align ko observables with store observables
      
      $.ajax({
        url: '/search/web',
        cache: false,
        type: 'GET',
        success: successHandler(rows),
        error: function(err){
          console.warn("Error fetching webResults: ", err);
        }
      });
      
      return rows;
    },
    savedSearches: function(){
      return services.query({ type: 'search' });
    }
  });
  
  return services;
});