'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function ($scope, users, task, tags, $state, TasksService, context) {
    $scope.people = users;
    $scope.task = task;
    $scope.tags = tags;
    $scope.project = $scope.task.project;

    $scope.tagInputVisible = false;

    debugger;

    if (!$scope.task) {
        $state.go('main.tasks.byentity', {
            entity: context.entityName,
            entityId: context.entityId
        });
    }

    $scope.statuses = ['Received', 'Completed'];

    $scope.getUnusedTags = function () {
        return _.chain($scope.tags).reject(function (t) {
            return $scope.task.tags.indexOf(t.term) >= 0;
        }).sortBy(function (a, b) {
            return b.count - a.count;
        }).pluck('term').value();
    };

    $scope.$watch('task.description', function (nVal, oVal) {
        if (nVal !== oVal && oVal) {
            $scope.delayedUpdate($scope.task);
        }
    });

    $scope.addTag = function (tag) {
        $scope.task.tags.push(tag);
        $scope.update(task);
        $scope.tagInputVisible = false;
    };

    $scope.removeTag = function (tag) {
        $scope.task.tags = _($scope.task.tags).without(tag);
        $scope.update($scope.task);
    };

    $scope.dueOptions = {
        onSelect: function () {
            $scope.update($scope.task);
        }
    };

    $scope.star = function (task) {
        TasksService.star(task).then(function() {
            $state.reload('main.tasks.byentity.details');
        });
    };

    $scope.update = function (task) {
        if (context.entityName === 'discussion') {
            task.discussion = context.entityId;
        }

        TasksService.update(task).then(function() {
            $state.reload('main.tasks.byentity');
        });
    };

    $scope.delayedUpdate = _.debounce($scope.update, 500);

    if ($scope.task &&
            ($state.current.name === 'main.tasks.byentity.details' ||
             $state.current.name === 'main.search.task')) {
        $state.go('.activities');
    }
});
