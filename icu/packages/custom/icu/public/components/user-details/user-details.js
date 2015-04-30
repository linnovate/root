'use strict';

angular.module('mean.icu.ui.userdetails', [])
.controller('UserDetailsController', function($scope, user, users, notifications, $state) {
    $scope.user = user;
    $scope.people = users;

    $scope.notifications = notifications;

    $scope.lastNotification = _($scope.notifications).last();

    if ($scope.user) {
        $state.go('.projects');
    }
});
