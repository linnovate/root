'use strict';

angular.module('mean.icu.ui.folderdetails')
.controller('FolderActivitiesController', function ($scope, entity, context, activities) {
    //$scope.project = entity || context.entity;
    $scope.activities = activities;
});
