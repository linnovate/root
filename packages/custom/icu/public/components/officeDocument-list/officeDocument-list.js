'use strict';

function OfficeDocumentListController($scope, $state, officeDocuments, OfficeDocumentsService, context, $stateParams, EntityService) {

    $scope.items = officeDocuments.data || officeDocuments;

    $scope.entityName = 'officeDocuments';
    $scope.entityRowTpl = '/icu/components/officeDocument-list/officeDocument-row.html';

    $scope.update = function(item) {
        return OfficeDocumentsService.update(item);
    }

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    }

    $scope.create = function(parentsFolder) {

        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };

        if(parentsFolder){
            newItem.folder = parentsFolder;
        }

        return OfficeDocumentsService.createDocument(newItem).then(function(result) {
            result.created = new Date(result.created);
            $scope.items.push(result);
            return result;
        });
    }

    $scope.loadMore = function(start, LIMIT, sort) {
        return OfficeDocumentsService.getAll(start, LIMIT, sort).then(function(docs) {
            $scope.items.concat(docs);
            return $scope.items;
        });
    }
}

angular.module('mean.icu.ui.officedocumentlist', []).controller('OfficeDocumentListController', OfficeDocumentListController);
