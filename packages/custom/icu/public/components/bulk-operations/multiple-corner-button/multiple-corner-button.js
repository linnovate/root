'use strict';

angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleCornerButton', function () {
        function controller($rootScope, $scope, MultipleSelectService) {
            $scope.selectedItems = $scope.$parent.selectedItems || MultipleSelectService.getSelected();
            $scope.cornerState = $scope.$parent.cornerState || MultipleSelectService.getCornerState();

            $scope.notifyChangingState = () => $rootScope.$broadcast('changeCornerState', MultipleSelectService.changeCornerState());

            $scope.$on('refreshBulkButtonsAccess', () => $scope.changeCornerState());
            $scope.changeCornerState = () => {
              $scope.cornerState = MultipleSelectService.getCornerState();
              $scope.selectedItems = MultipleSelectService.getSelected();
            }
        }

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-corner-button/multiple-corner-button.html',
        };
    });
