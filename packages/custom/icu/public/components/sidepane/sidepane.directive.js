'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, ProjectsService, DiscussionsService, UsersService) {
        $scope.discussions = DiscussionsService.getAll();
        $scope.people = UsersService.getAll();

        ProjectsService.getAll().then(function(projects) {
            $scope.projects = projects;
        });

        $scope.items = [{
            name: 'Tasks',
            icon: 'fa-2x fa-check-square',
            state: 'main.tasks'
        }, {
            name: 'Projects',
            icon: 'fa-2x fa-briefcase',
            state: 'main.projects'
        }, {
            name: 'Meetings',
            icon: 'fa-2x fa-comments-o',
            state: 'main.meetings'
        }, {
            name: 'People',
            icon: 'fa-2x fa-user',
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
        scope: true
    };
});
