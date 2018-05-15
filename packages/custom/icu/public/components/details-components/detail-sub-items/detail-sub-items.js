'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-favorite></detail-favorite>
 */
angular.module('mean.icu.ui.detailsComponents')
  .directive('detailSubItems', detailSubItems);

function detailSubItems() {

 return {
    scope:{
      value: "=", 
      onChange: "="  
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-sub-items/detail-sub-items.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {
    
    $scope.saveTemplate = function() {
      $scope.isopen = false;
      $scope.newTemplate.frequentUser = $scope.newTemplate.watcher;
      if ($scope.item.subProjects[0]._id) {
        ProjectsService.saveTemplate($stateParams.id, $scope.newTemplate).then(function(result) {
          $scope.showMsgSavedTpl = true;
          $scope.newTemplate.name = '';
          var element = angular.element('.sub-projects .fa-chevron-down')[0];
          $timeout(function() {
            element.click();
          }, 0);
          $timeout(function() {
            $scope.showMsgSavedTpl = false;
          }, 3000);
          $scope.template.push(result);
        });
      }
    }

    function deleteClass(projects) {
      for (var i = projects.length - 1; i >= 0; i--) {
        projects[i].isNew = false;
      }
    }

    $scope.template2subProjects = function(templateId) {
      $scope.isopen = false;
      ProjectsService.template2subProjects(templateId, {
        'projectId': $stateParams.id
      }).then(function(result) {
        for (var i = result.length - 1; i >= 0; i--) {
          result[i].isNew = true;
        }

        $timeout(function() {
          deleteClass(result);
        }, 5000);
        var tmp = $scope.item.subProjects.pop();
        $scope.item.subProjects = $scope.item.subProjects.concat(result);
        $scope.item.subProjects.push(tmp);
      });
    }

    $scope.deleteTemplate = function(id, index) {
      ProjectsService.deleteTemplate(id).then(function(result) {
        $scope.template.splice(index, 1);
      });
    }

  }
}
