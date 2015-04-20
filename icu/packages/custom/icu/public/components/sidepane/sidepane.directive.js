'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
  function controller($scope) {
      $scope.items = [{
          name: 'Tasks',
          active: false,
          icon: 'fa-3x fa-check-square'
      }, {
          name: 'Projects',
          active: false,
          icon: 'fa-3x fa-briefcase'
      }, {
          name: 'Meetings',
          active: false,
          icon: 'fa-3x fa-comments-o'
      }, {
          name: 'People',
          active: true,
          icon: 'fa-3x fa-user'
      }];

      $scope.projects = [{
          name: 'ICU',
          id: 1,
          color: 'green'
      }, {
          name: 'Linnovate',
          id: 2,
          color: 'blue'
      }, {
          name: 'Pixel',
          id: 3,
          color: 'pink'
      }];

      $scope.discussions = [{
          name: 'Project review',
          id: 1,
          active: true
      }, {
          name: 'Weekly review',
          id: 2,
          active: false
      }, {
          name: 'QBR',
          id: 3,
          active: false
      }];

      $scope.selected = function(item) {
          $scope.items.forEach(function(i) {
              i.active = false;
          });

          item.active = true;
      };
  }

  return {
    restrict: 'A',
    controller: controller,
    templateUrl: '/icu/components/sidepane/sidepane.html'
  };
});
