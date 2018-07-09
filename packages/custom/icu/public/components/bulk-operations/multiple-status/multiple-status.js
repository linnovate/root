'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleStatus', function () {
        function controller($scope) {

            let type = 'status';

            $scope.selecteditems = $scope.$parent.selecteditems;

            $scope.allowed = $scope.$parent.bulkOperationAllowed(type);
        }
        return {
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-status/multiple-status.html',
            restrict: 'E',
        };
    });


