'use strict';

angular.module('mean.icu.ui.taskoptions', [])
.controller('TaskOptionsController', function ($scope, $state, tasks, TasksService) {

	//TasksService.getMyTasksStatistics().then(function(data) {
//		$scope.statistics = _.object(_.pluck(data, 'key'), _.pluck(data, 'value'));
//	});

	$scope.filterRecycled = function(data) {
		return data.filter(entity => {			
			return !entity.hasOwnProperty('recycled');
		});
	}
	

	$scope.countTasksForTodayOrWeek = function(forToday){
		if(forToday){
			var date = new Date().getThisDay();
		}
		else{
			var date = new Date().getWeek();
		}
		var count = 0;
		var data = $scope.filterRecycled(tasks) ;
		console.log("countTasksForTodayOrWeek",data) ;
		data.forEach(function(task) {
			var due = new Date(task.due);
			if (due >= date[0] && due <= date[1]) {
				count++;
			}
		});
		return count;
	};

	$scope.countOverDueTasks = function(){
		var date = new Date().getThisDay();
		var count=0;
		var data = $scope.filterRecycled(tasks) ;
		data.forEach(function(task) {
			var due = new Date(task.due);
			if (due < date[0]) {
				count++;
			};
		});
		return count;
	}

	$scope.statistics={};
	$scope.statistics.tasksDueToday = $scope.countTasksForTodayOrWeek(true);
	$scope.statistics.tasksDueWeek = $scope.countTasksForTodayOrWeek(false);
	$scope.statistics.overDueTasks = $scope.countOverDueTasks();
	TasksService.getWatchedTasks().then(function(data) {
		data = $scope.filterRecycled(data) ;
		$scope.statistics.WatchedTasks = data.length ;
	});



	$scope.filterTasks = function(filterValue) {
		TasksService.filterValue = filterValue;
		console.log("filterValue",filterValue) ;
		if(filterValue=='watched'){
			TasksService.getWatchedTasks().then(function(result){
				TasksService.watchedTasksArray = $scope.filterRecycled(result) ;
			});
		}
    };

	if ($state.current.name === 'main.tasks.byassign') {
		$state.go('.activities');
	}


});
