'use strict';

angular.module('mean.icu.ui.attachmentdetails')
    .controller('AttachmentVersionsController', function ($scope, versions, entity) {
        $scope.attachment = entity;
        $scope.versions = versions;
    });
