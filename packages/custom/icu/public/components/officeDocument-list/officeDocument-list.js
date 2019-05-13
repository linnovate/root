'use strict';

function OfficeDocumentListController($scope, $state, BoldedService, NotifyingService, officeDocuments, OfficeDocumentsService, MultipleSelectService, context, $stateParams, EntityService) {

    $scope.items = officeDocuments.data || officeDocuments;

    $scope.entityName = 'officeDocuments';
    $scope.entityRowTpl = '/icu/components/officeDocument-list/officeDocument-row.html';

    $scope.update = function(item) {
        return OfficeDocumentsService.update(item);
    };

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'officeDocuments');
    };

    $scope.create = function(parent) {
        let newItem = {};
        if(parent){
            newItem[parent.type] = parent.id;
        }
        return OfficeDocumentsService.createDocument(newItem).then(function(result) {
            $scope.items.push(result);
            return result;
        });
    };

    $scope.order = {
        field: $stateParams.sort || 'created',
        order: 1
    };

    $scope.loadNext = officeDocuments.next;
    $scope.loadPrev = officeDocuments.prev;
}

angular.module('mean.icu.ui.officedocumentlist', []).controller('OfficeDocumentListController', OfficeDocumentListController);
