'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleStatus', function () {
        function controller($scope, MultipleSelectService) {

            let type = 'status';

            $scope.selecteditems = $scope.$parent.selectedItems;

            $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, type)

        }
        return {
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-status/multiple-status.html',
            restrict: 'E',
        };
    });


