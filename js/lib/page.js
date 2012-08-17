define(['vendor/compose', 'vendor/knockout'], function(Compose, ko){

  var Page = Compose(Compose, {
    initialize: function(options){
      
      return this;
    },
    applyBindings: function(viewModel){
      var selfNode = $(this.el)[0];
      ko.applyBindings(viewModel || this, selfNode);
      return this;
    },
    setStore: function(store){
      var self = this;
      store = this.store = store;
    
      return this;
    }
  });
  
  return Page;
});