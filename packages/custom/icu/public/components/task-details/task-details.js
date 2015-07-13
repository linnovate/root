'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function($scope, users, task, tags, project, $state, TasksService) {
    $scope.people = users;
    $scope.task = task;
    $scope.tags = tags;
    $scope.project = project;

    $scope.task.project = project;

    $scope.statuses = ['Received', 'Completed'];

    $scope.$watch('task.description', function(nVal, oVal) {
        if (nVal !== oVal && oVal) {
            $scope.delayedUpdate($scope.task);
        }
    })

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

    $scope.delayedUpdate = _.debounce($scope.update, 500);

    if ($scope.task && $state.current.name === 'main.tasks.byentity.details') {
        $state.go('.activities');
    }
});
