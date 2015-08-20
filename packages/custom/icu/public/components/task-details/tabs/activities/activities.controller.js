'use strict';

angular.module('mean.icu.ui.taskdetails')
.controller('TaskActivitiesController', function ($scope, entity, context, activities) {
    $scope.task = entity || context.entity;
    $scope.activities = activities;
});
