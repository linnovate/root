'use strict';

angular.module('mean.icu.ui.login', [])
.controller('LoginController', function ($scope, $state, UsersService) {
    $scope.login = function (credentials) {
    	var logErrorMessages = {
			'Unauthorized': 'unauthorized',
			'Bad Request': 'badRequest'
		};
        $scope.errorMessage = '';
        UsersService.login(credentials).then(function (result) {
            if (result.status == 200) {
            	$state.go('main.tasks');
                //$state.go('socket');
            } else {
            	$scope.errorMessage = logErrorMessages[result.data];
            }
        });
    };
});
