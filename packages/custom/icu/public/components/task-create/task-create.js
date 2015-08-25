'use strict';

angular.module('mean.icu.ui.taskcreate', [])
    .controller('TaskCreateController', function ($scope, ProjectsService, TasksService, $state, context) {

        $scope.task = {};

        if (context.entityName === 'project') {
            $scope.task.project = context.entityId;
        } else if (context.entityName === 'discussion') {
            $scope.task.discussion = context.entityId;
        }

        ProjectsService.getAll().then(function (result) {
            $scope.projects = result;
        });

        var goToDetails = function (id, newContext) {
            $state.go('main.tasks.byentity.details', {
                id: id,
                entity: newContext.entityName,
                entityId: newContext.entityId
            }, {
                reload: true
            });
        };

        $scope.create = function () {
            TasksService.create($scope.task).then(function (result) {
                if (result._id) {
                    $scope.closeThisDialog();

                    if (context.entityName === 'project' && context.entityId !== $scope.task.project) {
                        goToDetails(result._id, context);
                    }
                }

            });
        };

        $scope.search = function () {
            TasksService.search($scope.term).then(function (result) {
                $scope.searchResults = result;
            });
        };

        $scope.select = function (task) {
            $scope.closeThisDialog();
            goToDetails(task._id, context);
        };
    });
