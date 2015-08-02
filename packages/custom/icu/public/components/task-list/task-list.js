'use strict';

angular.module('mean.icu.ui.tasklist')
.controller('TaskListController', function ($scope, $state, tasks, TasksService) {
    $scope.tasks = tasks;

    $scope.create = function() {
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
        $state.go('.details', {
            id: $scope.tasks[0]._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId
        });
    }
});
