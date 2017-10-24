'use strict';

angular.module('mean.icu.ui.projectdetails')
.controller('ProjectActivitiesController', function ($scope, entity, context, activities, ActivitiesService) {
    //$scope.project = entity || context.entity;
    $scope.activities = activities;
    ActivitiesService.data = $scope.activities;
});
