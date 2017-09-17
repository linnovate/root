'use strict';

angular.module('mean.icu.ui.officedetails')
    .controller('OfficeTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;
    });
