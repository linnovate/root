'use strict';

angular.module('mean.icu.ui.projectdetails', [])
.controller('ProjectDetailsController', function ($scope, project, users, context, $state) {
    $scope.context = context;

    $scope.project = project;
    $scope.people = users;
});
