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
                '0097A7',
                '00AEEF',
                '2979FF',
                '0054A6',
                'F06EAA',
                'AB47BC',
                '6FBA09',
                '598527',
                'F7941D',
                'F69679',
                'EF5350',
                'FF4081'
            ];

            $scope.triggerDropdown = function () {
                $scope.isOpen = !$scope.isOpen;
            };

            $scope.selectColor = function (color) {
                $scope.currentColor = color;
                $scope.isOpen = false;
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
