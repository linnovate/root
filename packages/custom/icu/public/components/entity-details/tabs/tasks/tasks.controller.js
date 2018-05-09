'use strict';

angular.module('mean.icu.ui.entityDetails')
    .controller('EntityTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;
    });
