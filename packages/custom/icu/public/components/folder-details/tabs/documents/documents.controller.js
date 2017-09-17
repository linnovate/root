'use strict';

angular.module('mean.icu.ui.folderdetails')
    .controller('FolderDocumentsController', function ($scope, entity, context, documents) {
        //$scope.project = entity || context.entity;
        $scope.documents = documents;
    });
