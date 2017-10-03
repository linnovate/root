'use strict';

angular.module('mean.icu.ui.templateDocdetails')
.controller('TemplateDocActivitiesController', function ($scope, entity, context, activities) {
    //$scope.project = entity || context.entity;
    $scope.activities = activities;
});
