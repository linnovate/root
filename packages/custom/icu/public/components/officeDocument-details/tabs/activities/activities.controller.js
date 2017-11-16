'use strict';

angular.module('mean.icu.ui.officeDocumentdetails')
.controller('OfficeDocumentActivitiesController', function ($scope, entity, context, activities, ActivitiesService) {
   // $scope.officeDocument = entity || context.entity;
    $scope.activities = activities;
    ActivitiesService.data = $scope.activities;
});
