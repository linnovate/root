'use strict';

function OfficeDocumentListController($scope, $state, officeDocuments, OfficeDocumentsService, context, $stateParams, EntityService) {

    $scope.items = officeDocuments.data || officeDocuments;

    $scope.entityName = 'officeDocuments';
    $scope.entityRowTpl = '/icu/components/officeDocument-list/officeDocument-row.html';

    $scope.loadNext = officeDocuments.next;
    $scope.loadPrev = officeDocuments.prev;

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    }

    $scope.update = function(item) {
        return OfficeDocumentsService.update(item);
    }

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

<<<<<<< HEAD
    $scope.loadMore = function(start, LIMIT, sort) {
        if (!$scope.isLoading && $scope.loadNext) {
            $scope.isLoading = true;
            $scope.loadNext().then(function(items) {

                _(items.data).each(function(p) {
                    p.__state = creatingStatuses.Created;
                });

                var offset = $scope.displayOnly ? 0 : 1;

                if (items.data.length) {
                    var index = $scope.items.length - offset;
                    var args = [index, 0].concat(items.data);

                    [].splice.apply($scope.items, args);
                }

                $scope.loadNext = items.next;
                $scope.loadPrev = items.prev;
                $scope.isLoading = false;
            });
        }
=======
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
>>>>>>> fffa147be7b5393e8d5682393809346fae8a2038
    }
}

angular.module('mean.icu.ui.officedocumentlist', []).controller('OfficeDocumentListController', OfficeDocumentListController);
