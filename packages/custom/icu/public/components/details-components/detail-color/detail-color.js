'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailColor', detailColor);

function detailColor() {

 return {
    scope:{
      value: "=",
      onChange: "="  
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-color/detail-color.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {
    $scope.$watch('value', function (nVal, oVal) {
        if (nVal !== oVal) {
            var context = {
                name: 'color',
                oldVal: oVal,
                newVal: nVal,
                action: 'changed'
            };
            $scope.onChange(context);
        }
    });

  }
}
