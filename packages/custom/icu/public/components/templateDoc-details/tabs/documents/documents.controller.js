'use strict';

angular.module('mean.icu.ui.templateDocdetails')
    .controller('TemplateDocDocumentsController', function ($scope, entity, context, documents) {
        //$scope.project = entity || context.entity;
        $scope.documents = documents;
    });
