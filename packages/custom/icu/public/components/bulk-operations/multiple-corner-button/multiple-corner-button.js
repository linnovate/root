angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleCornerButton', function () {
        function controller($scope, MultipleSelectService) {
            $scope.selectedItems = $scope.$parent.selectedItems;
            $scope.cornerState = $scope.$parent.cornerState;

            $scope.changeCornerState = function(){
                $scope.cornerState = MultipleSelectService.changeCornerState();
                $scope.$emit('changeCornerState', $scope.cornerState);
            }
        }

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-corner-button/multiple-corner-button.html',
        };
    });
