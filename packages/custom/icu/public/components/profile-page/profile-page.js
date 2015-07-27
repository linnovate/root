'use strict';

angular.module('mean.icu.ui.profile', [])
.controller('ProfileController', function($scope, me, UsersService) {
    $scope.me = me;

    $scope.uploadAvatar = function(files) {
        if (files.length) {
            var file = files[0];
            UsersService.updateAvatar(file);
        }
    };

    $scope.editProfile = function(form) {
        UsersService.update($scope.me);
    };
});
