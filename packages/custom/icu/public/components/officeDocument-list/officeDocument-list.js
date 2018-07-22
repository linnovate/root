'use strict';

function OfficeDocumentListController($scope, $state, BoldedService, officeDocuments, OfficeDocumentsService, MultipleSelectService, context, $stateParams, EntityService) {

    $scope.items = officeDocuments.data || officeDocuments;

    $scope.entityName = 'officeDocuments';
    $scope.entityRowTpl = '/icu/components/officeDocument-list/officeDocument-row.html';

    $scope.update = function(item) {
        return OfficeDocumentsService.update(item);
    }

  $scope.getBoldedClass = function(entity){
    return BoldedService.getBoldedClass(entity, 'officeDocuments');
  };

    $scope.create = function(parent) {
        var data = {};
        if(parent){
            data.folder = parent.id;
        }
        //         if ($stateParams.entity == 'folder') {
        //             data['folder'] = $stateParams.entityId;
        //         }

        return OfficeDocumentsService.createDocument(data).then(function(result) {
            result.created = new Date(result.created);
            $scope.items.push(result);
            //             if (localStorage.getItem('type') == 'new') {
            //                 if (context.entityName == 'folder') {
            //                     $scope.items = $scope.items.filter(function(officeDocument) {
            //                         return officeDocument.status == 'new' && officeDocument.folder && officeDocument.folder._id == context.entityId;
            //                     });

            //                 } else {

            //                     $scope.items = $scope.items.filter(function(officeDocument) {
            //                         return officeDocument.status == 'new';
            //                     });

            //                 }
            //             }
            return result;
        });
    }

    $scope.refreshSelected = function (entity) {
        MultipleSelectService.refreshSelectedList(entity);
        $scope.$broadcast('refreshList', {})
    };

    $scope.$on('changeCornerState', function(event, cornerState){
        setAllSelected(cornerState === 'all');
    });

    function setAllSelected(status){
        for(let i = 0; i < $scope.items.length; i++){
            $scope.items[i].selected = status;
        }
        MultipleSelectService.changeAllSelectedLIst(MultipleSelectService.getNoneRecycledItems($scope.items));
    }

    //     $scope.search = function(item) {
    //         return OfficeDocumentsService.search(term).then(function(searchResults) {
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

    $scope.order = {
        field: $stateParams.sort || 'created',
        order: 1
    };

    $scope.loadMore = function() {
        var LIMIT = 25 ;
        var start = $scope.items.length;
        var sort = $scope.order.field;
        $scope.delayedLoad(start, LIMIT, sort);
    };
    $scope.delayedLoad = _.debounce(loadNext, 150);
    function loadNext(start, LIMIT, sort){
        OfficeDocumentsService.getAll(start , LIMIT , sort)
            .then(function(docs){
                for(let i = 0; i < docs.length; i++){ $scope.items.push(docs[i]) }
            });
    }
}

angular.module('mean.icu.ui.officedocumentlist', []).controller('OfficeDocumentListController', OfficeDocumentListController);
