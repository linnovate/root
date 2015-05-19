'use strict';

angular.module('mean.icu.ui.detailspane', []).
directive('icuDetailspane', function() {
  function controller() {

  }

  return {
    restrict: 'A',
    controller: controller,
    templateUrl: '/icu/components/detailspane/detailspane.html'
  };
});
