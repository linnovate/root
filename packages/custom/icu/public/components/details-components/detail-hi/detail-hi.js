'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailHi', detailHi);

function detailHi() {

 return {
    scope:{
      value: "=",
      onClick: "&"  
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-hi/detail-hi.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {
    if ($scope.value == false) {
      $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
    }
    
    $scope.click = function () {
      if ($scope.value == false) {
        $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
        $scope.onClick();
      }
    }
  }
}
