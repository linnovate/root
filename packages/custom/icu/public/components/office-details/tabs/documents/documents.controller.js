'use strict';

angular.module('mean.icu.ui.officedetails')
    .controller('OfficeDocumentsController', function ($scope, entity, context, documents) {
        //$scope.project = entity || context.entity;
        $scope.documents = documents;
    });
