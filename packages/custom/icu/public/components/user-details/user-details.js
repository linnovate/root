'use strict';
angular.module('mean.icu.ui.userdetails', [])
.controller('UserDetailsController', function($scope, user, users, $state) {
    $scope.user = user;
    $scope.people = users;

    if ($scope.user && $state.current.name === 'main.people.details') {
        $state.go('.projects');
    }
});
