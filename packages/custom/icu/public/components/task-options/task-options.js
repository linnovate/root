'use strict';

angular.module('mean.icu.ui.taskoptions', [])
.controller('TaskOptionsController', function ($scope, $state, tasks, TasksService) {
	
	TasksService.getMyTasksStatistics().then(function(data) {
		$scope.statistics = _.object(_.pluck(data, 'key'), _.pluck(data, 'value'));
		
	});

	$scope.filterTasks = function(filterValue) {
		TasksService.filterValue = filterValue;
	};

	if ($state.current.name === 'main.tasks.byassign') {
		$state.go('.activities');
	}
});