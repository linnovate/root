'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state) {
        $scope.items = [{
            name: 'Tasks',
            icon: 'fa-3x fa-check-square',
            state: 'main.tasks'
        }, {
            name: 'Projects',
            icon: 'fa-3x fa-briefcase',
            state: 'main.projects'
        }, {
            name: 'Meetings',
            icon: 'fa-3x fa-comments-o',
            state: 'main.meetings'
        }, {
            name: 'People',
            icon: 'fa-3x fa-user',
            state: 'main.people'
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

        $scope.isCurrentState = function(item) {
            return $state.current.name.indexOf(item.state) === 0;
        };
    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html'
    };
});
