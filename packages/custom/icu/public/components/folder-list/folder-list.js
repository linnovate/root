'use strict';

angular.module('mean.icu.ui.folderlist', [])
    .controller('FolderListController', function ($scope,
                                                   $state,
                                                   folders,
                                                   FoldersService,
                                                   context,
                                                   $filter,
                                                   $stateParams,
                                                   OfficesService) {
        $scope.folders = folders.data || folders;
        $scope.loadNext = folders.next;
        $scope.loadPrev = folders.prev;
        if ($scope.folders.length > 0 && !$scope.folders[$scope.folders.length - 1].id) {
		    $scope.folders = [$scope.folders[0]];
	    }

        function init() {
            if(context.entity){
                if(!context.entity.parent) {
                    if(context.entity.office ){
                        $scope.parentState = 'byentity';
                        $scope.parentEntity ='office' ;
                        $scope.parentEntityId = context.entity.office._id;
                        $scope.parentId = context.entity.id;
                    }
                }
                if(context.entityName === 'office') {
                    ProjectsService.selected = context.entity;
                }
            }
            else {
                $scope.parentState = 'byparent';
                $scope.parentEntity = 'folder';
                if(context.entity){
                    $scope.parentEntityId = context.entity.parent;
                    $scope.parentId = context.entity.id;
                }
            }
	    }


        $scope.starred = $stateParams.starred;
        if ($scope.folders.length > 0 && !$scope.folders[$scope.folders.length - 1].id) {
 		    $scope.folders = [$scope.folders[0]];
 	    }

        	$scope.isCurrentState = function(ids) {
		return ids.indexOf($state.current.name) !== -1;
	};

        $scope.reverse = true;

        $scope.changeOrder = function () {
            $scope.reverse = !$scope.reverse;

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


        $scope.getOfficeName=function(){
            var entityType = $scope.currentContext.entityName;
            if($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined&&
            $scope.currentContext.entity.title!=undefined){
                return $scope.currentContext.entity.title;
            }
            else if ($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined
            && $scope.currentContext.entity.name!=undefined){
                return $scope.currentContext.entity.name;
            }
            else{
                if(OfficesService.currentOfficeName!=undefined){
                    return OfficesService.currentOfficeName;
                }
                else{
                    var folders = $scope.folders;
                    if(folders.length==1){
                        $state.go('401');
                        return "you dont have permission";
                    }
                    else{
                        var folder = folders[0];
                        var result;
                        if(folder.office!=undefined){
                            result = folder.office.title
                        }
                        else{
                            result = "you dont have permission";
                        }
                        return result;
                    }
                }

            }
        }

        if ($scope.folders.length) {
            if ($state.current.name === 'main.folders.all' ||
                $state.current.name === 'main.folders.byentity') {
                navigateToDetails($scope.folders[0]);
            }
        } else if (
            $state.current.name !== 'main.folders.byentity.activities'
                && $state.current.name !== 'main.folders.byentity.folders'
                && $state.current.name !== 'main.folders.all'
                && $state.current.name !== 'main.folders.byentity.details.activities'
                && $state.current.name !== 'main.folders.byassign.details.activities'
                ) {
            $state.go('.activities');
        }

    });
