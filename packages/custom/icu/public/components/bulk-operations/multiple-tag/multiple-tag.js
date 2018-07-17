'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleTag', function () {
        function multipleTagController($scope, MultipleSelectService) {

            $scope.type = 'tags';

            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, $scope.type)

        }
        return {
            controller: multipleTagController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{
                entityType: "="
            }
        };
    });


