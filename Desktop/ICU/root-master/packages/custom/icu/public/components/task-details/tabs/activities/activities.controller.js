'use strict';

angular.module('mean.icu.ui.taskdetails')
.controller('TaskActivitiesController', function ($scope, entity, context, activities, tasks, ActivitiesService) {
    $scope.activities = activities;
	ActivitiesService.data = $scope.activities;
	
    var tasksNames = _.object(_.pluck(tasks, '_id'), _.pluck(tasks, 'title'));

    $scope.activities.forEach(function(a) {
    	a.taskName = tasksNames[a.issueId];
    })
});
