'use strict';

angular.module('mean.icu.ui.taskdetails')
.controller('TaskActivitiesController', function ($scope, task, activities) {
    $scope.task = task;
    $scope.activities = activities;
});
