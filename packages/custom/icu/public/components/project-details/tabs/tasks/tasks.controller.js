'use strict';

angular.module('mean.icu.ui.projectdetails')
    .controller('ProjectTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;
    });
