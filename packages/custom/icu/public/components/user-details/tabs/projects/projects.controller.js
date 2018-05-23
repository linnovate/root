'use strict';

angular.module('mean.icu.ui.userdetails')
.controller('UserProjectsController', function ($scope, userProjects) {
    $scope.projects = userProjects;
});
