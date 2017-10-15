'use strict';

angular.module('mean.icu.ui.officeDocumentdetails')
    .controller('OfficeDocumentDocumentsController', function ($scope, entity, context, documents) {
        //$scope.officeDocument = entity || context.entity;
        $scope.documents = documents;
    });
