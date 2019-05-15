'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailTemplater', detailTemplater);

function detailTemplater($timeout) {

 return {
    scope:{
      templates: '=',
      item: "=",
      onSave: '=',
      onDelete: '=',
      onImplement: '=',
      users: '=',
      me: '=',
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-templater/detail-templater.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {
    $scope.newTemplate = {
        'name': '',
        'watcher': $scope.me,
        'permission': {
          id: $scope.me,
          level: 'editor'
        }
    };
    $scope.saveTemplate = function() {
      $scope.isopen = false;
      $scope.newTemplate.frequentUser = $scope.newTemplate.watcher;

      $scope.onSave($scope.newTemplate).then(result => {
        $scope.showMsgSavedTpl = true;
        $scope.newTemplate.name = '';
        var element = angular.element('.sub-entity .fa-chevron-down')[0];
//         $timeout(function() {
//           element.click();
//         }, 0);
        $timeout(function() {
          $scope.showMsgSavedTpl = false;
        }, 3000);
        $scope.templates.push(result);
      });
    }

    $scope.implementTemplate = function(templateId) {
      $scope.isopen = false;
      $scope.onImplement(templateId);
    }

    $scope.deleteTemplate = function(id, index) {
      $scope.onDelete(id).then(function(result) {
        $scope.templates.splice(index, 1);
      });
    }

  }
}
