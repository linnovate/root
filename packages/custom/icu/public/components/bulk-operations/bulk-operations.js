'use strict';

angular.module('mean.icu.ui.bulkoperations', [])
    .directive('multipleSelect', function () {
        function controller($scope, MultipleSelectService) {

            $scope.selectedItems = $scope.$parent.selectedItems;

            $scope.bulkUpdate = function(type){
                MultipleSelectService.haveBulkPerms($scope.selectedItems, type)
            };

        }
        return {
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/bulk-operations.html',
            restrict: 'E',
        };
    });


