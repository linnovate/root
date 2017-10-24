'use strict';

angular.module('mean.icu.ui.officedetails')
.controller('OfficeActivitiesController', function ($scope, entity, context, activities, ActivitiesService) {
    //$scope.project = entity || context.entity;
    $scope.activities = activities;
    ActivitiesService.data = $scope.activities;
});
