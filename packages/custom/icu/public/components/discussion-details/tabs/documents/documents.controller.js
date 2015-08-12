'use strict';

angular.module('mean.icu.ui.discussiondetails')
    .controller('DiscussionDocumentsController', function ($scope, context, documents) {
        $scope.discussion = context.entity;
        $scope.documents = documents;
    });
