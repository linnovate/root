'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-assign></detail-assign>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailAssign', detailAssign);

function detailAssign($i18next) {

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
    $scope.oldValue = angular.copy($scope.value);

    if($scope.list[0].id !== 'no-select') {
      $scope.list.unshift({
        name: $i18next('noSelect'),
        job: $i18next('noSelect'),
        id: 'no-select'
      })
    }

    $scope.onSelect = function(value) {
      if(value !== $scope.oldValue) {
        $scope.oldValue = angular.copy(value);
        $scope.onChange(value);
      }
    }

  }
}
