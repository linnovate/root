'use strict';

angular.module('mean.icu.ui.inbox').controller('InboxListController',
    function ($scope, $state, $stateParams, me, activities) {
        $scope.me = me;
        $scope.activities = activities;
    });
