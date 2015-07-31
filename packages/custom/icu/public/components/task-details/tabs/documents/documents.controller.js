'use strict';

angular.module('mean.icu.ui.taskdetails')
    .controller('TaskDocumentsController', function ($scope, task, documents) {
        $scope.task = task;
        $scope.documents = documents;
    });
