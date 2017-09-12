'use strict';

angular.module('mean.icu.ui.officeDocumentdetails')
    .controller('OfficeDocumentTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;
    });
