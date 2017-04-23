'use strict';

angular.module('mean.icu.ui.discussiondetails')
.controller('DiscussionActivitiesController', function ($scope, entity, context, activities) {
    //$scope.discussion = entity || context.entity;
    $scope.activities = activities;
});
