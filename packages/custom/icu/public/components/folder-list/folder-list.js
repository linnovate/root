'use strict';

angular.module('mean.icu.ui.folderlist', [])
    .controller('FolderListController', function ($scope,
                                                   $state,
                                                   folders,
                                                   FoldersService,
                                                   context,
                                                   $filter,
                                                   $stateParams) {
        $scope.folders = folders.data || folders;
        $scope.loadNext = folders.next;
        $scope.loadPrev = folders.prev;

        $scope.starred = $stateParams.starred;
        if ($scope.folders.length > 0 && !$scope.folders[$scope.folders.length - 1].id) {
 		    $scope.folders = [$scope.folders[0]];
 	    }

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.folders.byentity') === 0 &&
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

        function navigateToDetails(folder) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.folders.all.details' : 'main.folders.byentity.details';

            $state.go($scope.detailsState, {
                id: folder._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
            });
        }

        $scope.toggleStarred = function () {
            $state.go($state.current.name, { starred: !$stateParams.starred });
        };
        
        if ($scope.folders.length) {
            if ($state.current.name === 'main.folders.all' ||
                $state.current.name === 'main.folders.byentity') {
                navigateToDetails($scope.folders[0]);
            }
        }
        else {
            if ($state.current.name === 'main.folders.all') {
                return;
            }
            if (
                $state.current.name !== 'main.folders.byentity.activities' &&
                $state.current.name !== 'main.folders.byentity.details.activities') {
                $state.go('.activities');
            }
        }
    });
