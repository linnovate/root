'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, context) {
        $scope.context = context;

        $scope.projects = $scope.projects.data || $scope.projects;
        $scope.discussions = $scope.discussions.data || $scope.discussions;
        $scope.people = $scope.people.data || $scope.discussions;

        $scope.toggleVisibility = function(toggledItem) {
            var prev = toggledItem.open;

            $scope.items.forEach(function(i) {
                i.open = false;
            });

            toggledItem.open = !prev;
        }

        $scope.items = [{
            name: 'tasks',
            icon: '/icu/assets/img/task.png',
            state: 'tasks',
            display: ['projects', 'discussions', 'people'],
            open: false
        }, {
            name: 'projects',
            icon: '/icu/assets/img/project.png',
            state: 'projects',
            display: ['discussions', 'people'],
            open: false
        }, {
            name: 'discussions',
            icon: '/icu/assets/img/meeting.png',
            state: 'discussions',
            display: ['projects', 'people'],
            open: false
        }, {
            name: 'people',
            icon: '/icu/assets/img/people.png',
            state: 'people',
            display: ['projects', 'discussions'],
            open: false
        }];

        $scope.isCurrentState = function(item) {
            return item.state === context.main;
        };
    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html',
        scope: {
            projects: '=',
            discussions: '=',
            people: '='
        }
    };
});
