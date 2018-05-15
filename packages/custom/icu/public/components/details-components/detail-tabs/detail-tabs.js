'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tabs></detail-tabs>
 */
angular.module('mean.icu.ui.detailsComponents') 
  .directive('detailTabs', detailTabs);

function detailTabs() {

 return {
    scope:{ 
      value: "=", 
      tabs: "=",
      onChange: "="  
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-tabs/detail-tabs.html',
    restrict: 'E'
  };
 
  function link($scope, element, attrs) {
//     $scope.onSelect = function(value) {
//       $scope.value = value;
//       $scope.onChange(value);
//     }

  }
}