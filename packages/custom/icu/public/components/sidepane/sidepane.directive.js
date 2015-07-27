'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, DiscussionsService, UsersService, context) {
        DiscussionsService.getAll().then(function(result) {
            $scope.discussions = result;
        });
        UsersService.getAll().then(function(result) {
            $scope.people = result;
        });
        $scope.context = context;

        $scope.items = [{
            name: 'Tasks',
            icon: '/icu/assets/img/task.png',
            state: 'main.tasks',
            display: ['projects', 'discussions', 'people']
        }, {
            name: 'Projects',
            icon: '/icu/assets/img/project.png',
            state: 'main.projects',
            display: ['discussions', 'people']
        }, {
            name: 'Meetings',
            icon: '/icu/assets/img/meeting.png',
            state: 'main.discussions',
            display: ['projects', 'people']
        }, {
            name: 'People',
            icon: '/icu/assets/img/people.png',
            state: 'main.people',
            display: ['projects', 'discussions']
        }];

        $scope.isCurrentState = function(item) {
            return $state.current.name.indexOf(item.state) === 0;
        };
    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html',
        scope: {
            projects: '='
        }
    };
});
