'use strict';

angular.module('mean.icu.ui.officeDocumentdetails')
.controller('OfficeDocumentActivitiesController', function ($scope, entity, context, activities) {
    $scope.officeDocument = entity || context.entity;
    $scope.activities = activities;
});
