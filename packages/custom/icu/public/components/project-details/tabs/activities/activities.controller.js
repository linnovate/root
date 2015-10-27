'use strict';

angular.module('mean.icu.ui.projectdetails')
.controller('ProjectActivitiesController', function ($scope, entity, context, activities) {

    //$scope.project = entity || context.entity;
    $scope.activities = activities;
});
