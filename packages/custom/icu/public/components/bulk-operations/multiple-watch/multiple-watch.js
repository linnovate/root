'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleWatch', function () {
        function multipleWatchController($scope, MultipleSelectService) {

            $scope.type = 'watch';

            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, $scope.type)

        }
        return {
            controller: multipleWatchController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


