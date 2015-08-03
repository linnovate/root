'use strict';

angular.module('mean.icu.ui.tasklist')
.controller('TaskListController', function ($scope, $state, tasks, TasksService) {
    $scope.tasks = tasks;
    $scope.showStarred = false;

    function navigateToDetails(task) {
        $state.go('main.tasks.byentity.details', {
            id: task._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId
        });
    }

    $scope.starredOnly = function () {
        $scope.showStarred = !$scope.showStarred;
        if ($scope.showStarred) {
            TasksService.getStarred().then(function(starred) {
                $scope.tasks = _(tasks).reduce(function(list, item) {
                    var contains = _(starred).any(function(s) {
                        return s._id === item._id;
                    });

                    if (contains) {
                        list.push(item);
                    }

                    return list;
                }, []);

                navigateToDetails($scope.tasks[0]);
            });
        } else {
            $scope.tasks = tasks;
            navigateToDetails($scope.tasks[0]);
        }
    };

    $scope.create = function () {
        var task = {
            title: 'New task',
            description: 'Task description',
            project: $scope.currentContext.entityId,
            status: 'Received'
        };

        TasksService.create(task).then(function () {
            $state.go('main.tasks.byentity.details', {
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId
            }, {reload: true});
        });
    };

    if ($scope.tasks.length && $state.current.name === 'main.tasks.byentity') {
        navigateToDetails($scope.tasks[0]);
    }
});
