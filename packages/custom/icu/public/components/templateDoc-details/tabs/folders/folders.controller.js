'use strict';

angular.module('mean.icu.ui.templateDocdetails')
    .controller('TemplateDocFoldersController', function ($scope, entity, context, folders, $state) {
        $scope.folders = folders;
    });
