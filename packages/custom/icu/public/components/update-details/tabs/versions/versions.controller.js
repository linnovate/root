'use strict';

angular.module('mean.icu.ui.attachmentdetails')
    .controller('AttachmentVersionsController', function ($scope, versions, entity) {
        $scope.update = entity;
        $scope.versions = versions;
    });
