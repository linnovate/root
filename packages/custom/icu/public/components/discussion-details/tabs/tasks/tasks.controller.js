'use strict';

angular.module('mean.icu.ui.discussiondetails')
    .controller('DiscussionTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;

        $scope.manageTasks = function () {
            $state.go('main.tasks.byentity.tasks', {
                entity: 'discussion',
                id: $scope.discussion._id,
                entityId: $scope.discussion._id
            });
        };
    });
