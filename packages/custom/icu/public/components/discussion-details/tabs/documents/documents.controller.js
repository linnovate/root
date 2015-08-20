'use strict';

angular.module('mean.icu.ui.discussiondetails')
    .controller('DiscussionDocumentsController', function ($scope, entity, context, documents) {
        $scope.discussion = entity || context.entity;
        $scope.documents = documents;
    });
