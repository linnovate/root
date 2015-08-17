'use strict';

angular.module('mean.icu.ui.discussiondetails')
    .controller('DiscussionTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.discussion = entity;
        $scope.tasks = tasks;

        $scope.manageTasks = function () {
            $state.go('main.tasks.byentity.tasks', {
                entity: 'discussion',
                entityId: $scope.discussion._id
            });
        };
    });
