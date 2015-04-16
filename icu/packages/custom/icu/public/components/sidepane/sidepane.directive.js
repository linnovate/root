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
