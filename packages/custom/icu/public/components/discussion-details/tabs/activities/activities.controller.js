'use strict';

angular.module('mean.icu.ui.discussiondetails')
.controller('DiscussionActivitiesController', function ($scope, context, activities) {
    $scope.discussion = context.entity;
    $scope.activities = activities;
});
