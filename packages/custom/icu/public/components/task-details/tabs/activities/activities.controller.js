'use strict';

angular.module('mean.icu.ui.taskdetails')
.controller('TaskActivitiesController', function ($scope, entity, context, activities, tasks) {
    $scope.activities = activities;

    var tasksNames = _.object(_.pluck(tasks, '_id'), _.pluck(tasks, 'title'));

    $scope.activities.forEach(function(a) {
    	a.taskName = tasksNames[a.issueId];
    })
});
