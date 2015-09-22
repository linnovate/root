'use strict';

angular.module('mean.icu.ui.discussiondetails')
    .controller('DiscussionTasksController', function ($scope, entity, context, tasks, $state) {
        $scope.tasks = tasks;
    });
