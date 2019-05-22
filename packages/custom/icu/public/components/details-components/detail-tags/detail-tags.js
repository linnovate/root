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

    $scope.tags = $scope.value || [];
    $scope.list = $scope.list || [];

    $scope.addTag = function(tag) {
      if(!$scope.tags.includes(tag)) {
        $scope.tags.push(tag);
        $scope.onChange($scope.tags);
      }
    }

    $scope.removeTag = function(tag) {
      $scope.tags = _($scope.tags).without(tag);
      $scope.onChange($scope.tags);
    }
  }
}
