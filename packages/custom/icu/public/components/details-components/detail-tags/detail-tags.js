'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tags></detail-tags>
 */
angular.module('mean.icu.ui.detailsComponents').directive('detailTags', detailTags);

function detailTags($timeout) {

  return {
    scope: {
      value: "=",
      list: "=",
      onChange: "="
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-tags/detail-tags.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    function showPlaceholder() {
      $timeout(() => {
        let placeholder = element[0].querySelector('.ui-select-match').getAttribute('placeholder');
        let input = element[0].querySelector('input');
        input.placeholder = placeholder;
      })
    }

    showPlaceholder()

    $scope.update = function() {
      showPlaceholder();

      if(typeof $scope.onChange !== 'function') return;

      $timeout(() => {
        $scope.onChange($scope.value);
      })
    }

  }
}
