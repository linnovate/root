'use strict';

angular.module('mean.icu.ui.taskoptions', [])
.controller('TaskOptionsController', function ($scope, $state, tasks, TasksService, NotifyingService, DetailsPaneService) {

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
	    data = filterRecycled(data) ;
        $scope.statistics.WatchedTasks = data.length ;
	});

	$scope.filterTasks = function (filterValue) {
		TasksService.filterValue = filterValue;
		if (filterValue === 'watched') {
			TasksService.getWatchedTasks().then(function (result) {
				TasksService.watchedTasksArray = filterRecycled(result);
			});
		}
        NotifyingService.notify('filterMyTasks');
  };

	if ($state.current.name === 'main.tasks.byassign') {
		$state.go('.' + window.config.defaultTab);
	}
});
