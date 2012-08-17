define([
  'dollar', 
  'vendor/compose', 
  'services/core', 
  'vendor/knockout', 
  'vendor/knockout.mapping'
], function(
  $, 
  Compose, 
  services, 
  ko
){

  function dataToViewModel(data){
    // util.defaults(data, proto);
    var viewModel = ko.mapping.fromJS(data);
    return viewModel;
  }
  
  services.search = Compose.create(services.search || {}, {
    yourResults: function(query, options){
      options = options || {};
      var self = this;
      var rows = options.rows || ko.observableArray([]);
      
      // we return the observable array, but call splice on it with the results when the come back
      // as its observable, it should result in updates to all listeners
      // need to align ko observables with store observables
      
      $.ajax({
        url: '/search/user',
        success: function(results){
          var len = ('function' == typeof rows) ? rows().length : rows.length;
          // rows is observable, so splice triggers updates in any bindings
          rows.splice.apply(rows, [0, len].concat(results.map( dataToViewModel )) );
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
        success: function(results){
          var len = ('function' == typeof rows) ? rows().length : rows.length;
          // rows is observable, so splice triggers updates in any bindings
          rows.splice.apply(rows, [0, len].concat(results.map( dataToViewModel )) );
        },
        error: function(err){
          console.log("Error fetching theirResults");
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
        success: function(results){
          var len = ('function' == typeof rows) ? rows().length : rows.length;
          // rows is observable, so splice triggers updates in any bindings
          rows.splice.apply(rows, [0, len].concat(results.map( dataToViewModel )) );
        },
        error: function(err){
          console.log("Error fetching theirResults");
        }
      });
      
      return rows;
    }
  });
  
  return services;
});