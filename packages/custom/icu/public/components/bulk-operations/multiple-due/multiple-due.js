'use strict';


angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleDue', function () {
        function multipleDueController($scope, MultipleSelectService) {

            $scope.type = 'due';

            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.allowed = MultipleSelectService.haveBulkPerms($scope.selectedItems, $scope.type)

        }
        return {
            controller: multipleDueController,
            templateUrl: '/icu/components/bulk-operations/bulk-operations-button.html',
            restrict: 'E',
            scope:{}
        };
    });


