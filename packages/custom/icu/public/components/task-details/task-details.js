'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function($scope, users, task, project, $state) {
    $scope.people = users;
    $scope.task = task;
    $scope.project = project;

    $scope.task.project = project;

    if ($scope.task && $state.current.name === 'main.tasks.details') {
        $state.go('.activities');
    }
});
