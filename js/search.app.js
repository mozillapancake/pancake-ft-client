define(['vendor/compose', 'lib/page', 'services/search'], function(Compose, Page, services){
  console.log("search.app loaded");
  
  // various views, aggregated onto one page
  var app = Compose.create({});
  // page has a lifecycle: initialize, assign store, applyBindings
  
  var viewModel = {
    yourResults:    services.search.yourResults(),
    theirResults:   services.search.theirResults(),
    webResults:     services.search.webResults()
  };
  
  // viewModel.applyBindings();
  
});