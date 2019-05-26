'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-assign></detail-assign>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailAssign', detailAssign);

function detailAssign() {

  return {
    scope: {
      value: "=",
      list: "=",
      me: "=", 
      onChange: "="
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-assign/detail-assign.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    $scope.list = angular.copy($scope.list);

    if($scope.list[0].name !== 'no select') {
      $scope.list.unshift({
        name: 'no select',
        job: 'no select'
      })
    }

    $scope.onSelect = function(value) {
      $scope.onChange(value);
    }

  }
}
