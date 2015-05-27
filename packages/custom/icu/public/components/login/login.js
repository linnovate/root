'use strict';

angular.module('mean.icu.ui.login', [])
.controller('LoginController', function($scope, $state, UsersService) {
    $scope.login = function(credentials) {
        UsersService.login(credentials).then(function() {
            $state.go('main.tasks');
        });
    }
});
