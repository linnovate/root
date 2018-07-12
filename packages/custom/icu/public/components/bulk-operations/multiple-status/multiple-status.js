'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleStatus', function () {
        function controller($scope, MultipleSelectService) {

            let type = 'status';

            $scope.selectedItems = $scope.$parent.selectedItems;

            if($scope.selectedItems.length){
                $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, type)
            }
        }
        return {
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-status/multiple-status.html',
            restrict: 'E',
        };
    });


