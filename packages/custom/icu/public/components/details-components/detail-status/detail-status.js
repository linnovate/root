'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailStatus', detailStatus);

function detailStatus() {

 return {
    scope:{
      value: "=",
      list: "=",
      onChange: "="  
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-status/detail-status.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {
    
    $scope.onSelect = function(value) {
      $scope.onChange(value);
    }

  }
}