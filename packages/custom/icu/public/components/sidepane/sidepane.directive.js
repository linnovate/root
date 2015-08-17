'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, context) {
        $scope.context = context;

        $scope.items = [{
            name: 'Tasks',
            icon: '/icu/assets/img/task.png',
            state: 'tasks',
            display: ['projects', 'discussions', 'people']
        }, {
            name: 'Projects',
            icon: '/icu/assets/img/project.png',
            state: 'projects',
            display: ['discussions', 'people']
        }, {
            name: 'Discussions',
            icon: '/icu/assets/img/meeting.png',
            state: 'discussions',
            display: ['projects', 'people']
        }, {
            name: 'People',
            icon: '/icu/assets/img/people.png',
            state: 'people',
            display: ['projects', 'discussions']
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
