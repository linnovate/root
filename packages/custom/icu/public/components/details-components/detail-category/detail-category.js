'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tags></detail-tags>
 */
angular.module('mean.icu.ui.detailsComponents').directive('detailCategory', detailCategory);

function detailCategory() {

  return {
    scope: {
      value: "=",
      items: "=",
      onChange: "="
    }, 
    link: link,
    templateUrl: '/icu/components/details-components/detail-category/detail-category.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {


  }
}
