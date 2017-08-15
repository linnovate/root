'use strict';

angular.module('mean.icu.ui.projectdetails')
    .controller('ProjectDocumentsController', function ($scope, entity, context, documents) {
        //$scope.project = entity || context.entity;
        $scope.documents = documents;
    });
