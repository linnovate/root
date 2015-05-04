'use strict';

angular.module('mean.icu.ui.userdetails')
.controller('UserProjectsController', function($scope, projects) {
    $scope.projects = projects;
});
