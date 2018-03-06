'use strict';

angular.module('mean.icu.ui.taskdetails')
    .controller('TaskDocumentsController', function ($scope, entity, context, documents, tasks, AttachmentsService) {
        //$scope.task = entity || context.entity;
        $scope.documents = documents;
        
        
        var tasksNames = _.object(_.pluck(tasks, '_id'), _.pluck(tasks, 'title'));

        $scope.documents.map(doc => AttachmentsService.getAttachmentUser(doc.creator).then(user =>
            doc.attUser = user.name 
        ))

	    $scope.documents.forEach(function(a) {
            a.taskName = tasksNames[a.issueId];

	    })
    });
