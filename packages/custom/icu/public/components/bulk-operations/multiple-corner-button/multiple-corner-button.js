angular.module('mean.icu.ui.bulkoperations')
    .directive('multipleCornerButton', function () {
        function controller($scope) {
            $scope.selectedItems = $scope.$parent.selectedItems;
        }

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '/icu/components/bulk-operations/multiple-corner-button/multiple-corner-button.html',
        };
    });
