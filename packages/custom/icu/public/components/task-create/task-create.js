'use strict';

angular.module('mean.icu.ui.taskcreate', [])
.controller('TaskCreateController', function($scope, projects, TasksService) {
    $scope.projects = projects;
    $scope.task = {};

    if ($scope.projects.length) {
        $scope.task.project = _($scope.projects).first()._id;
    }

    $scope.create = function() {
        return TasksService.create($scope.task);
    };
});
