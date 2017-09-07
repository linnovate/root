'use strict';

angular.module('mean.icu.ui.officedetails')
.controller('OfficeActivitiesController', function ($scope, entity, context, activities) {
    //$scope.project = entity || context.entity;
    $scope.activities = activities;
});
