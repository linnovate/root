"use strict";

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular
  .module("mean.icu.ui.detailsComponents")
  .directive("detailColor", detailColor);

function detailColor() {
  return {
    scope: {
      value: "=",
      onChange: "="
    },
    link: link,
    templateUrl:
      "/icu/components/details-components/detail-color/detail-color.html",
    restrict: "E"
  };

  function link($scope, element, attrs) {
    let oldVal = $scope.value;
    $scope.onSelect = function(value) {
      if (value !== oldVal) {
        var context = {
          name: "color",
          oldVal: oldVal,
          newVal: value,
          action: "changed"
        };
        oldVal = value;
        $scope.onChange(context);
      }
    };
  }
}
