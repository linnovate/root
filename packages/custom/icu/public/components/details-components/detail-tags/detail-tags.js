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

    $scope.value = $scope.value || [];

    $scope.getUnusedTags = function() {
      return ($scope.list || []).filter(x => $scope.value.indexOf(x) < 0)
    }

    $scope.addTagClicked = function() {
      $scope.tagInputVisible = true;
      $timeout(function() {
        var element = angular.element('#addTag .ui-select-toggle')[0];
        element.click();
      }, 0);
    }

    $scope.addTag = function(tag) {
      if(!$scope.value.includes(tag)){
        $scope.value.push(tag);
        $scope.onChange($scope.value);
      }
//       $scope.newTag = null;
      $scope.tagInputVisible = false;
    }

    $scope.removeTag = function(tag) {
      $scope.value = _($scope.value).without(tag);
//       $scope.newTag = null;
      $scope.onChange($scope.value);
    }

    $scope.onOpenClose = function(isOpen) {
      $scope.tagInputVisible = !isOpen;
    }


  }
}
