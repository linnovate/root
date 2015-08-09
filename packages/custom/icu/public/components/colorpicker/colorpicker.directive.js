'use strict';

angular.module('mean.icu.ui.colorpicker', [])
    .directive('icuColorpicker', function () {
        function link($scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$render = function () {
                $scope.currentColor = ngModelCtrl.$viewValue;
                if ($scope.currentColor.indexOf('#') !== -1) {
                    $scope.currentColor = $scope.currentColor.substring(1);
                }
            };

            $scope.isOpen = false;
            $scope.colors = [
                'ffffff',
                '747474',
                '0054a6',
                '00aeef',
                '197b30',
                'b9e67d',
                'fff200',
                'ffa000',
                '605ca8',
                '92278f',
                'f49ac1',
                'ed1c24'
            ];

            $scope.triggerDropdown = function () {
                $scope.isOpen = !$scope.isOpen;
            };

            $scope.selectColor = function (color) {
                $scope.currentColor = color;
                ngModelCtrl.$setViewValue(color);
            };
        }

        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: link,
            templateUrl: '/icu/components/colorpicker/colorpicker.html'
        };
    });
