'use strict';

function InboxListController($scope, $state, $stateParams, context, activities) {
    $scope.activities = activities;

}

angular.module('mean.icu.ui.inbox', []).controller('InboxListController', InboxListController);
