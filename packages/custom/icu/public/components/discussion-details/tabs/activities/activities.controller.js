'use strict';

angular.module('mean.icu.ui.discussiondetails')
.controller('DiscussionActivitiesController', function ($scope, entity, context, activities, ActivitiesService) {
    //$scope.discussion = entity || context.entity;
    $scope.activities = activities;
    ActivitiesService.data = $scope.activities;
});
