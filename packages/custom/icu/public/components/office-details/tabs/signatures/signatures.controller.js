'use strict';

angular.module('mean.icu.ui.officedetails')
    .controller('OfficeSignaturesController', function ($scope, entity, context, signatures, $state) {
        $scope.signatures = signatures;
    });
