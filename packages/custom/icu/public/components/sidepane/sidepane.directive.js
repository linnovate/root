'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, context, TasksService, $rootScope, SearchService) {
        $scope.context = context;
        
        $scope.folders = $scope.folders.data || $scope.folders;
        $scope.offices = $scope.offices.data || $scope.offices;
        $scope.projects = $scope.projects.data || $scope.projects;
        $scope.discussions = $scope.discussions.data || $scope.discussions;
        $scope.officeDocuments = $scope.officeDocuments.data || $scope.officeDocuments;
        //$scope.templateDocs = $scope.templateDocs.data || $scope.templateDocs;
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

            if ((context.main === 'templateDocs') && (item.display != undefined) && (item.display[1] === 'templateDocs'))
            {
                return true;
            }
            else if ((context.main === 'offices') && (item.display != undefined) && (item.display[0] === 'offices'))
            {
                return true;
            }

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

        $scope.GoToMyTasks = function() {
            $state.go('main.tasks.byassign');
        }

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
        },
        {
            name: 'settings',
            icon: '/icu/assets/img/settings.png',
            state: 'folders.all',
            display: ['offices', 'templateDocs'],
            open: $scope.isCurrentState({state: 'folders'})
        },
        // , {
        //     name: 'people',
        //     icon: '/icu/assets/img/people.png',
        //     state: 'people',
        //     display: ['projects', 'discussions'],
        //     open: false
        // }
        {
            name: 'officeDocuments',
            icon: '/icu/assets/img/icon-document.svg',
            state: 'officeDocuments.all',
            display: ['folders'],//['new', 'received', 'inProgress'],
            open: $scope.isCurrentState({state: 'officeDocuments'})
        }
        ];

        $scope.entities = [
            {label:'tasks', value: true, name: 'task'}, 
            {label:'projects', value: false, name: 'project'},
            {label:'discussions', value: false, name: 'discussion'},
            {label:'offices', value: false, name: 'office'},
            {label:'folders', value: false, name: 'folder'},
            {label:'documents', value:true, name: 'officeDocument'}
        ];
        $scope.filteringData = {
            entity: 'task'
        }

        $scope.filterSearchResults = function() {
            SearchService.filteringData = $scope.filteringData;
        }

        $scope.filterSearchResults();

        $scope.resetFilter = function() {

        }

    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html',
        scope: {
            projects: '=',
            discussions: '=',
            offices: '=',
            folders: '=',
            //people: '='
            officeDocuments: '=',
            templateDocs: '=',
            currentState: '@'
        }
    };
});
