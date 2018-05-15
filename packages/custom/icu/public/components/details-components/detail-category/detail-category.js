'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tags></detail-tags>
 */
angular.module('mean.icu.ui.detailsComponents').directive('detailCategory', detailCategory);

function detailCategory() {

  return {
    scope: {
      value: "=",
      list: "=",
      onChange: "="
    }, 
    link: link,
    templateUrl: '/icu/components/details-components/detail-category/detail-category.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    $scope.value = $scope.value || [];

    $scope.getUnusedTags = function() {
      return $scope.list.filter(x => $scope.value.indexOf(x) < 0)
    }

    $scope.addTagClicked = function() {
      $scope.tagInputVisible = true;
      var element = angular.element('#addTag > input.ui-select-focusser')[0];
//       $timeout(function() {
        element.focus();
//       }, 0);
    }

    $scope.addTag = function(tag) {
      if (tag != undefined && $.inArray(tag, $scope.value) == -1) {
        $scope.value.push(tag);
        $scope.onChange($scope.value);
      }
      $scope.tagInputVisible = false;
    }
    
    $scope.removeTag = function(tag) {
      $scope.value = _($scope.value).without(tag);
      $scope.onChange($scope.value);
    }

  }
}
