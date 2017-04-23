'use strict';

angular.module('mean.icu.ui.login', [])
.controller('LoginController', function ($scope, $state, UsersService, $cookies) {
    
    if ($cookies.get('token') && $cookies.get('token').length) {
        localStorage.setItem('JWT', $cookies.get('token'));
/*        $cookies.remove('token');
*/        $state.go('main.tasks');
    }
    
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
                $state.go('login');
            	$scope.errorMessage = logErrorMessages[result.data];
            }
        });
    };
});
