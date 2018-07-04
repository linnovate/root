'use strict';

function OfficeDocumentListController($scope, $state, BoldedService, officeDocuments, OfficeDocumentsService, context, $stateParams, EntityService) {

    $scope.items = officeDocuments.data || officeDocuments;

    $scope.entityName = 'officeDocuments';
    $scope.entityRowTpl = '/icu/components/officeDocument-list/officeDocument-row.html';

    $scope.update = function(item) {
        return OfficeDocumentsService.update(item);
    }

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'officeDocument');
    };

    $scope.create = function(parentsFolder) {
        var data = {};
        if(parentsFolder){
            data.folder = parentsFolder;
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

    $scope.loadMore = function(start, LIMIT, sort) {
        return OfficeDocumentsService.getAll(start, LIMIT, sort).then(function(docs) {
            $scope.items.concat(docs);
            return $scope.items;
        });
    }
}

angular.module('mean.icu.ui.officedocumentlist', []).controller('OfficeDocumentListController', OfficeDocumentListController);
