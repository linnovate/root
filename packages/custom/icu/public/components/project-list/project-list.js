'use strict';

angular.module('mean.icu.ui.projectlist', [])
    .controller('ProjectListController', function ($scope,
                                                    $window,
                                                   $state,
                                                   projects,
                                                   ProjectsService,
                                                   context,
                                                   $filter,
                                                   $stateParams,
                                                   EntityService) {
        $scope.projects = projects.data || projects;
        $scope.loadNext = projects.next;
        $scope.loadPrev = projects.prev;
        $scope.print = function() {
            $window.print()
        }

        $scope.starred = $stateParams.starred;

        // activeToggle
        $scope.activeToggleList = EntityService.activeToggleList;
        $scope.activeToggle = {
                field: !EntityService.isActiveStatusAvailable() ? 'all' : $stateParams.activeToggle || 'active',
                disabled: !EntityService.isActiveStatusAvailable() 
        };
        /*---*/

        if ($scope.projects.length > 0 && !$scope.projects[$scope.projects.length - 1].id) {
		    $scope.projects = [$scope.projects[0]];
	    }

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.projects.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

        $scope.changeOrder = function () {
            if($scope.sorting.field != "custom"){
                $scope.sorting.isReverse = !$scope.sorting.isReverse;
            }
            
            /*Made By OHAD - Needed for reversing sort*/
            $state.go($state.current.name, { sort: $scope.sorting.field });
        };

        $scope.sorting = {
            field: $stateParams.sort || 'created',
            isReverse: false
        };



        // $scope.$watch('sorting.field', function(newValue, oldValue) {
        //     if (newValue && newValue !== oldValue) {
        //         $state.go($state.current.name, { sort: $scope.sorting.field });
        //     }
        // });
        
        
       

        $scope.sortingList = [
            {
                title: 'title',
                value: 'title'
            }, {
                title: 'status',
                value: 'status'
            }, {
                title: 'created',
                value: 'created'
            }
        ];

         if(context.entityName != "all"){
            $scope.sortingList.push({
                title: 'custom',
                value: 'custom'
            });
        };

        function navigateToDetails(project) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.projects.all.details' : 'main.projects.byentity.details';

            $state.go($scope.detailsState, {
                id: project._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
            });
        }

        $scope.toggleStarred = function () {
            $state.go($state.current.name, { starred: !$stateParams.starred });
        };

        $scope.filterActive = function () {
            EntityService.activeStatusFilterValue = $scope.activeToggle.field ;
            $state.go($state.current.name, { activeToggle: $scope.activeToggle.field });		
        };
        
        if ($scope.projects.length) {
            if ($state.current.name === 'main.projects.all' ||
                $state.current.name === 'main.projects.byentity') {
                navigateToDetails($scope.projects[0]);
            }
        }
        else {
            if ($state.current.name === 'main.projects.all') {
                return;
            }
            if (
                $state.current.name !== 'main.projects.byentity.activities' &&
                $state.current.name !== 'main.projects.byentity.details.activities') {
                $state.go('.activities');
            }
        }
    });
