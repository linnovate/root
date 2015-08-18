'use strict';

angular.module('mean.icu.ui.discussiondetails', [])
    .controller('DiscussionDetailsController', function ($scope, entity, tasks, context, $state, DiscussionsService) {
        $scope.discussion = entity || context.entity;
        $scope.tasks = tasks;

        $scope.sendSummary = function (discussion) {
            DiscussionsService.sendSummary(discussion);
        };

        $scope.statuses = ['Set', 'Done', 'Postpone', 'Canceled', 'Archived'];

        $scope.$watchGroup(['discussion.description', 'discussion.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.discussion);
            }
        });

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.discussion);
            },
            dateFormat: 'd.m.yy'
        };

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.star = function (discussion) {
            DiscussionsService.star(discussion).then(function () {
                $state.reload('main.tasks.byentity.details');
            });
        };

        $scope.deleteDiscussion = function (discussion) {
            DiscussionsService.remove(discussion._id).then(function () {
                $state.go('main.tasks.byentity', {
                    entity: context.entityName,
                    entityId: context.entityId
                }, {reload: true});
            });
        };

        $scope.update = function (discussion) {
            DiscussionsService.update(discussion);
        };

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if (
            $scope.discussion && (
            $state.current.name === 'main.tasks.byentity.details' ||
            $state.current.name === 'main.discussions.all.details' ||
            $state.current.name === 'main.discussions.byentity.details')) {
            $state.go('.activities');
        }
    });
