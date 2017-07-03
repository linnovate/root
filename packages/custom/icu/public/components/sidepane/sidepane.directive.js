'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, context, TasksService, $rootScope) {
        $scope.context = context;

        $scope.projects = $scope.projects.data || $scope.projects;
        $scope.discussions = $scope.discussions.data || $scope.discussions;
        // $scope.people = $scope.people.data || $scope.people;
        
        $scope.toggleVisibility = function(toggledItem) {
            var prev = toggledItem.open;

            $scope.items.forEach(function(i) {
                i.open = false;
            });

            toggledItem.open = !prev;
        }

        $scope.removeFilterValue = function() {
        	TasksService.filterValue = false;
        }

        $scope.isCurrentState = function(item) {

            if (item.state.includes("."))
            {
                return item.state.split(".")[0] === context.main;
            }
            else
            {
                return item.state === context.main;
            }
            
            //return item.state === context.main;
        };

        $scope.items = [{
            name: 'tasks',
            icon: '/icu/assets/img/task.png',
            state: 'tasks.all',
            display: ['projects', 'discussions', 'people'],
            open: $scope.isCurrentState({state: 'tasks'})
        }, {
            name: 'projects',
            icon: '/icu/assets/img/project.png',
            state: 'projects.all',
            display: ['discussions', 'people'],
            open: $scope.isCurrentState({state: 'projects'})
        }, {
            name: 'discussions',
            icon: '/icu/assets/img/meeting.png',
            state: 'discussions.all',
            display: ['projects', 'people'],
            open: $scope.isCurrentState({state: 'discussions'})
        }
        // , {
        //     name: 'people',
        //     icon: '/icu/assets/img/people.png',
        //     state: 'people',
        //     display: ['projects', 'discussions'],
        //     open: false
        // }
        ];

    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html',
        scope: {
            projects: '=',
            discussions: '='//,
            //people: '='
        }
    };
});
