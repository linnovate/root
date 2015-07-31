'use strict';

angular.module('mean.icu.ui.projectdetails', [])
.controller('ProjectDetailsController', function ($scope, project, $state) {
    $scope.project = project;
});
