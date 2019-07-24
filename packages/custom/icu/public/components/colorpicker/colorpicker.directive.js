"use strict";

angular
  .module("mean.icu.ui.colorpicker", [])
  .directive("icuColorpicker", function() {
    function link($scope, element, attrs, ngModelCtrl) {
      ngModelCtrl.$render = function() {
        $scope.currentColor = ngModelCtrl.$viewValue;
        if ($scope.currentColor.indexOf("#") !== -1) {
          $scope.currentColor = $scope.currentColor.substring(1);
        }
      };

      $scope.isOpen = false;
      $scope.colors = [
        "0097A7",
        "00b8e6",
        "2979FF",
        "0054A6",
        "F06EAA",
        "AB47BC",
        "6FBA09",
        "009900",
        "F7941D",
        "F69679",
        "ff1a1a",
        "FF4081",
        "000000",
        "808080",
        "ffff00",
        "8000ff"
      ];

      $scope.triggerDropdown = function() {
        $scope.isOpen = !$scope.isOpen;
      };

      $scope.selectColor = function(color) {
        $scope.currentColor = color;
        $scope.isOpen = false;
        $scope.onSelect && $scope.onSelect(color);
        ngModelCtrl.$setViewValue(color);
      };
    }

    return {
      restrict: "A",
      scope: true,
      require: "ngModel",
      link: link,
      templateUrl: "/icu/components/colorpicker/colorpicker.html"
    };
  });
