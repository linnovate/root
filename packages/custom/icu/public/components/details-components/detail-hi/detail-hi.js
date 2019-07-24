"use strict";

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular
  .module("mean.icu.ui.detailsComponents")
  .directive("detailHi", ["$window", detailHi]);

function detailHi($window) {
  return {
    scope: {
      value: "=",
      onClick: "&"
    },
    link: link,
    templateUrl: "/icu/components/details-components/detail-hi/detail-hi.html",
    restrict: "E"
  };

  function link($scope, element, attrs) {
    if ($scope.value.roomName) {
      $("#HI").css("background-image", "url(/icu/assets/img/Hi.png)");
    }

    $scope.clicked = false;
    $scope.click = function() {
      if (!$scope.clicked) {
        if (!$scope.value.roomName) {
          $("#HI").css("background-image", "url(/icu/assets/img/Hi.png)");
          $scope.clicked = !$scope.onClick();
        } else {
          $window.open(
            window.config.rocketChat.uri + "/group/" + $scope.value.roomName
          );
        }
      }
    };
  }
}
