'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDelete', function () {
        function multipleDeleteController($scope, MultipleSelectService) {

            $scope.type = 'delete';

            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, $scope.type)

        }
        return {
            controller: multipleDeleteController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


