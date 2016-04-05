'use strict';

angular.module('mean.icu.ui.register', [])
.controller('RegisterController', function($scope, $state, UsersService) {
    $scope.register = function(credentials) {
        $scope.errorMessage = '';
        UsersService.register(credentials).then(function(result) {
            if (result.status == 200) {
            	$state.go('main.tasks');
            } else {
            	$scope.errorMessage = result.data[0].msg;
            }
        });
    };
});
