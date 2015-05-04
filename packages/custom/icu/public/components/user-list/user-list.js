'use strict';

angular.module('mean.icu.ui.userlist', [])
.controller('UserListController', function($scope, users, $state) {
    $scope.people = users;

    if ($scope.people.length) {
        $state.go('main.people.details', { id: $scope.people[0].id });
    }
});
