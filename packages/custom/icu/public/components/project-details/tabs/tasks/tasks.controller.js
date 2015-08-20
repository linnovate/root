'use strict';

angular.module('mean.icu.ui.projectdetails')
    .controller('ProjectTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;

        $scope.manageTasks = function () {
            $state.go('main.tasks.byentity.tasks', {
                entity: 'project',
                id: $scope.project._id,
                entityId: $scope.project._id
            });
        };
    });
