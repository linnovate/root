'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, ProjectsService, DiscussionsService, UsersService, context) {
        $scope.discussions = DiscussionsService.getAll();
        $scope.people = UsersService.getAll();
        $scope.context = context;

        $scope.items = [{
            name: 'Tasks',
            icon: '/icu/assets/img/task.png',
            state: 'main.tasks'
        }, {
            name: 'Projects',
            icon: '/icu/assets/img/project.png',
            state: 'main.projects'
        }, {
            name: 'Meetings',
            icon: '/icu/assets/img/meeting.png',
            state: 'main.meetings'
        }, {
            name: 'People',
            icon: '/icu/assets/img/people.png',
            state: 'main.people'
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
            projects: '=',
        }
    };
});
