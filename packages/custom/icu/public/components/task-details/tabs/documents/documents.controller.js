'use strict';

angular.module('mean.icu.ui.taskdetails')
    .controller('TaskDocumentsController', function ($scope, entity, context, documents) {
        $scope.task = entity || context.entity;
        $scope.documents = documents;
    });
