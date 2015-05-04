'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, ProjectsService, DiscussionsService) {
        $scope.projects = ProjectsService.getAll();
        $scope.discussions = DiscussionsService.getAll();

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
