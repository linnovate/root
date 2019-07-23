'use strict';

angular.module('mean.icu.ui.taskoptions', [])
.controller('TaskOptionsController', function ($rootScope, $scope, $state, tasks, TasksService, NotifyingService, DetailsPaneService) {

  // Copy for safety
  tasks = angular.copy(tasks)

  // Cast `due` to Date for future use by `$scope.filterTasks`
  tasks.forEach(task => {
    task.due = new Date(task.due)
  });

  $scope.tabs = DetailsPaneService.orderTabs(['activities', 'documents']);

    function filterRecycled(data) {
      return data.filter(entity => {
        return !entity.hasOwnProperty('recycled');
      });
    }

  $scope.countTasksForTodayOrWeek = function (forToday) {
    if (forToday) {
      var date = new Date().getThisDay();
    } else {
      var date = new Date().getWeek();
    }
    var count = 0;
    var data = filterRecycled(tasks) ;
    data.forEach(function(task) {
      var due = new Date(task.due);
      if (due >= date[0] && due <= date[1]) {
        count++;
      }
    });
    return count;
  };

  $scope.countOverDueTasks = function () {
    var date = new Date().getThisDay();
    var count = 0;
    var data = filterRecycled(tasks) ;
        data.forEach(function(task) {
      var due = new Date(task.due);
      if (due < date[0]) {
        count++;
      };
    });
    return count;
  };

  $scope.statistics = {};
  $scope.statistics.tasksDueToday = $scope.countTasksForTodayOrWeek(true);
  $scope.statistics.tasksDueWeek = $scope.countTasksForTodayOrWeek(false);
  $scope.statistics.overDueTasks = $scope.countOverDueTasks();
  TasksService.getWatchedTasks().then(function (data) {
    data = filterRecycled(data);
    $scope.statistics.WatchedTasks = data.length;
  });

  $scope.filterTasks = function(filterValue) {
    if (filterValue === 'watched') {
      TasksService.getWatchedTasks().then(function (result) {
        $rootScope.$emit('filterMyTasks', result);
      });
    } else {
      var date, out;
      switch(filterValue) {
        case 'today':
          date = new Date().getThisDay();
          out = tasks.filter(t => t.due >= date[0] && t.due <= date[1])
          break;
        case 'week':
          date = new Date().getWeek();
          out = tasks.filter(t => t.due >= date[0] && t.due <= date[1])
          break;
        case 'overdue':
          date = new Date().getThisDay();
          out = tasks.filter(t => t.due < date[0])
          break;
      }
      $rootScope.$emit('filterMyTasks', out);
    }
  }

  if ($state.current.name === 'main.tasks.byassign') {
    $state.go('.' + window.config.defaultTab);
  }
});
