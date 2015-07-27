'use strict';

angular.module('mean.icu.ui.register', [])
.controller('RegisterController', function($scope, $state, UsersService) {
    $scope.register = function(credentials) {
        UsersService.register(credentials).then(function() {
            $state.go('main.tasks');
        });
    };
});
