define(['knockout', 'services/stack', 'viewmodel/page'], function(ko, stack, PageViewModel){
  
  var thumbnail = PageViewModel.thumbnail;

  var historyList = {
    recent: ko.observableArray([]).extend({
      wireTo: stack.activeStacks,
      composeWith: [function(values){
        return values.map(function(entry){
          entry.imgUrl = entry.thumbnail_key ? thumbnail(entry.thumbnail_key) : '';
          return entry;
        });
      }]
    })
  };
  return historyList;
  
});
