'use strict';

angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleCornerButton', function () {
        function controller($scope, MultipleSelectService) {
            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.cornerState = $scope.$parent.cornerState;

            $scope.notifyChangingState = function(){
                $scope.$emit('changeCornerState', MultipleSelectService.changeCornerState());
            };

            $scope.$on('refreshList', function (event) {
                $scope.changeCornerState();
            });

            $scope.changeCornerState = function(){
                $scope.cornerState = MultipleSelectService.getCornerState();
            };
        }

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-corner-button/multiple-corner-button.html',
        };
    });
