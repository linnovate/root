'use strict';

angular.module('mean.icu.ui.register', [])
.controller('RegisterController', function($scope, $state, UsersService) {
    $scope.register = function(credentials) {
        var regErrorMessages = {
			'You must enter a name': 'youMustEnterAName',
			'You must enter a valid email address': 'youMustEnterAValidEmailAddress',
			'E-mail address is already in-use': 'emailAddressIsAlreadyInUse',
			'Username already taken': 'usernameAlreadyTaken',
			'Username cannot be more than 20 characters': 'usernameCannotBeMoreThan20Characters',
			'Password must be between 8-20 characters long': 'passwordMustBeBetween8-20CharactersLong',
			'Passwords do not match': 'passwordsDoNotMatch'
		};
        $scope.errorMessage = '';
        UsersService.register(credentials).then(function(result) {
            if (result.status == 200) {
            	$state.go('main.tasks');
            } else {
            	$scope.errorMessage = regErrorMessages[result.data[0].msg];
            }
        });
    };
});
