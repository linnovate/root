'use strict';

angular.module('mean.icu.ui.officedetails')
    .controller('OfficeFoldersController', function ($scope, entity, context, folders, $state) {
        $scope.folders = folders;
    });
