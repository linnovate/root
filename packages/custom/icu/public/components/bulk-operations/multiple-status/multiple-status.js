'use strict';

angular.module('mean.icu.ui.bulkoperations').directive('multipleStatus', multipleStatus);

function multipleStatus() {

  return {
    scope: {
      selectedItems: "="
    },
    link: link,
    templateUrl: '/icu/components/bulk-operations/multiple-status/multiple-status.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

  }
}
