'use strict';

angular.module('mean.icu.ui.discussiondetails', [])
    .controller('DiscussionDetailsController', function ($scope, context, DiscussionsService) {
        $scope.discussion = context.entity;

        $scope.sendSummary = function () {

        };

        $scope.star = function () {

        };

        $scope.update = function (task) {
            if (context.entityName === 'discussion') {
                task.discussion = context.entityId;
            }

            DiscussionsService.update(task);
        };

    });
