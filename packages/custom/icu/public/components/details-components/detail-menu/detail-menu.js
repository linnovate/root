"use strict";

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tags></detail-tags>
 */
angular
  .module("mean.icu.ui.detailsComponents")
  .directive("detailMenu", detailMenu);

function detailMenu() {
  return {
    scope: {
      items: "="
    },
    link: link,
    templateUrl:
      "/icu/components/details-components/detail-menu/detail-menu.html",
    restrict: "E"
  };

  function link($scope, element, attrs) {}
}
