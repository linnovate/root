'use strict';

angular.module('mean.icu.ui.officeDocumentdetails')
    .controller('OfficeDocumentDocumentsController', function ($scope, entity, context, documents, AttachmentsService) {
        //$scope.officeDocument = entity || context.entity;

        $scope.documents = documents;
        $scope.documents.map(doc => AttachmentsService.getAttachmentUser(doc.creator)
            .then(user =>
                doc.attUser = user.name 
        ))

    });
