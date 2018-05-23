'use strict';

angular.module('mean.icu.ui.auth', [])
.controller('AuthController', function ($scope, $http, UsersService, $rootScope, $cookieStore, $cookies) {

    $scope.socialButtonsCounter = 0;

      $http.get('/api/get-config')
        .success(function(config) {
          $scope.socialButtons = config;
    });

    var tokenWatch = $rootScope.$watch(function() {
      return $cookies.get('token');
    }, function(newVal, oldVal) {
      if (newVal && newVal !== undefined && newVal !== null && newVal !== '') {
        UsersService.onIdentity({
          token: $cookies.get('token')
        });
        $cookieStore.remove('token');
        tokenWatch();
      }
    });
});
