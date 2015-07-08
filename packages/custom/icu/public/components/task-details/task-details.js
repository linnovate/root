'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function($scope, users, task, tags, project, $state, TasksService) {
    $scope.people = users;
    $scope.task = task;
    $scope.tags = tags;
    $scope.project = project;

    $scope.task.project = project;

    $scope.statuses = ['Received', 'Completed'];

    $scope.dueOptions = {
        onSelect: function() {
            $scope.update($scope.task);
        }
    }

    $scope.update = function(task) {
        TasksService.update(task).then(function() {
            $state.reload();
        });
    }

    if ($scope.task && $state.current.name === 'main.tasks.byentity.details') {
        $state.go('.activities');
    }
});
