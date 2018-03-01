'use strict';

angular.module('mean.icu.ui.discussiondetails')
    .controller('DiscussionDocumentsController', function ($scope, entity, context, documents, AttachmentsService) {
        
        $scope.documents = documents;
        $scope.documents.map(doc => AttachmentsService.getAttachmentUser(doc).then(user =>
            doc.attUser = user.name 
        ))

    });
