'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleAssign', function () {
        function multipleAssignController($scope, MultipleSelectService) {

            $scope.type = 'assign';

            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, $scope.type);

        }
        return {
            controller: multipleAssignController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


