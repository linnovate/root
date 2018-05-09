'use strict';

function FolderListController($scope, $state, folders, FoldersService, context, $stateParams, OfficesService) {

    $scope.items = folders.data || folders;

    $scope.entityName = 'folders';
    $scope.entityRowTpl = '/icu/components/folder-list/folder-row.html';

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    $scope.update = function(item) {
        return FoldersService.update(item.title);
    }

    $scope.create = function(item) {
        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };
        return FoldersService.create(newItem).then(function(result) {
            $scope.items.push(result);
            FoldersService.data.push(result);
            return result;
        });
    }

    //     $scope.search = function(item) {
    //         return OfficesService.search(term).then(function(searchResults) {
    //             _(searchResults).each(function(sr) {
    //                 var alreadyAdded = _($scope.items).any(function(p) {
    //                     return p._id === sr._id;
    //                 });

    //                 if (!alreadyAdded) {
    //                     return $scope.searchResults.push(sr);
    //                 }
    //             });
    //             $scope.selectedSuggestion = 0;
    //         });
    //     }

    $scope.loadMore = function(start, LIMIT, sort) {
        return OfficesService.getAll(start, LIMIT, sort).then(function(docs) {
            $scope.items.concat(docs);
            return $scope.items;
        });
    }

    //     function init() {
    //             if(context.entity){
    //                 if(!context.entity.parent) {
    //                     if(context.entity.office ){
    //                         $scope.parentState = 'byentity';
    //                         $scope.parentEntity ='office' ;
    //                         $scope.parentEntityId = context.entity.office._id;
    //                         $scope.parentId = context.entity.id;
    //                     }
    //                 }
    //                 if(context.entityName === 'office') {
    //                     ProjectsService.selected = context.entity;
    //                 }
    //             }
    //             else {
    //                 $scope.parentState = 'byparent';
    //                 $scope.parentEntity = 'folder';
    //                 if(context.entity){
    //                     $scope.parentEntityId = context.entity.parent;
    //                     $scope.parentId = context.entity.id;
    //                 }
    //             }
    // 	    }

    //         $scope.getOfficeName=function(){
    //             var entityType = $scope.currentContext.entityName;
    //             if($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined&&
    //             $scope.currentContext.entity.title!=undefined){
    //                 return $scope.currentContext.entity.title;
    //             }
    //             else if ($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined
    //             && $scope.currentContext.entity.name!=undefined){
    //                 return $scope.currentContext.entity.name;
    //             }
    //             else{
    //                 if(OfficesService.currentOfficeName!=undefined){
    //                     return OfficesService.currentOfficeName;
    //                 }
    //                 else{
    //                     var folders = $scope.folders;
    //                     if(folders.length==1){
    //                         $state.go('401');
    //                         return "you dont have permission";
    //                     }
    //                     else{
    //                         var folder = folders[0];
    //                         var result;
    //                         if(folder.office!=undefined){
    //                             result = folder.office.title
    //                         }
    //                         else{
    //                             result = "you dont have permission";
    //                         }
    //                         return result;
    //                     }
    //                 }

    //             }
    //         }

    //         if ($scope.folders.length) {
    //             if ($state.current.name === 'main.folders.all' ||
    //                 $state.current.name === 'main.folders.byentity') {
    //                 navigateToDetails($scope.folders[0]);
    //             }
    //         } else if (
    //             $state.current.name !== 'main.folders.byentity.activities'
    //                 && $state.current.name !== 'main.folders.byentity.folders'
    //                 && $state.current.name !== 'main.folders.all'
    //                 && $state.current.name !== 'main.folders.byentity.details.activities'
    //                 && $state.current.name !== 'main.folders.byassign.details.activities'
    //                 ) {
    //             $state.go('.activities');
    //         }
}

angular.module('mean.icu.ui.folderlist', []).controller('FolderListController', FolderListController);
