'use strict';

angular.module('mean.icu.ui.subprojects', [])
.controller('SubProjectsController', function ($scope, subprojects) {
    $scope.subprojects = subprojects;
});
