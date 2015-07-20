'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function($scope, users, task, tags, project, $state, TasksService) {
    $scope.people = users;
    $scope.task = task;
    $scope.tags = tags;
    $scope.project = project;

    $scope.task.project = project;
    $scope.tagInputVisible = false;

    $scope.statuses = ['Received', 'Completed'];

    $scope.getUnusedTags = function() {
        return _($scope.tags).reject(function(t) {
            return $scope.task.tags.indexOf(t) >= 0;
        });
    }

    $scope.$watch('task.description', function(nVal, oVal) {
        if (nVal !== oVal && oVal) {
            $scope.delayedUpdate($scope.task);
        }
    });

    $scope.addTag = function(tag) {
        $scope.task.tags.push(tag);
        $scope.update(task);
        $scope.tagInputVisible = false;
    }

    $scope.removeTag = function(tag) {
        $scope.task.tags = _($scope.task.tags).without(tag);
        $scope.update(task);
    }

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
