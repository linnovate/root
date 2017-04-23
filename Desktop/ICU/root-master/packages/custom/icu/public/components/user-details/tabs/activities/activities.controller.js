'use strict';

angular.module('mean.icu.ui.userdetails')
.controller('UserActivitiesController', function ($scope, activities) {
    $scope.activities = activities;
});
