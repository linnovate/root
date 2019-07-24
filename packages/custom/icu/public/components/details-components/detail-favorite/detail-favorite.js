"use strict";

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular
  .module("mean.icu.ui.detailsComponents")
  .directive("detailFavorite", detailFavorite);

function detailFavorite() {
  return {
    scope: {
      value: "=",
      onChange: "="
    },
    link: link,
    templateUrl:
      "/icu/components/details-components/detail-favorite/detail-favorite.html",
    restrict: "E"
  };

  function link($scope, element, attrs) {}
}
