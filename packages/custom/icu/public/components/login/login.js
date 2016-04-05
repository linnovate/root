'use strict';

angular.module('mean.icu.ui.login', [])
.controller('LoginController', function ($scope, $state, UsersService) {
    $scope.login = function (credentials) {
        $scope.errorMessage = '';
        UsersService.login(credentials).then(function (result) {
            if (result.status == 200) {
            	$state.go('main.tasks');
            } else {
            	$scope.errorMessage = result.data;
            }
        });
    };
});
