'use strict';

angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleCornerButton', function () {
        function controller($scope, MultipleSelectService) {
            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.cornerState = $scope.$parent.cornerState;

            $scope.changeCornerState = function(){
                $scope.cornerState = MultipleSelectService.changeCornerState();
                $scope.$emit('changeCornerState', $scope.cornerState);

                if($scope.cornerState === 'none'){
                    $scope.selectedItems = MultipleSelectService.refreshSelectedList();
                } else {
                    $scope.selectedItems = MultipleSelectService.getSelected();
                }
            };

            $scope.$on('refreshList', function (event) {
                $scope.cornerState = MultipleSelectService.getCornerState();
            });
        }

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-corner-button/multiple-corner-button.html',
        };
    });
