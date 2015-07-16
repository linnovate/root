'use strict';

angular.module('mean.icu.ui.profile', [])
.controller('ProfileController', function($scope, $state, me, profile, UsersService) {
    $scope.me = me;
    $scope.me.profile = profile;
    $scope.avatar = $scope.me.profile.avatar || 'http://placehold.it/250x250';
    $scope.hash = new Date().getTime();

    $scope.uploadAvatar = function(files) {
        if (files) {
            var file = files[0];
            UsersService.updateAvatar(file).success(function(data) {
                $scope.me.profile.avatar = data.avatar;

                UsersService.update($scope.me.profile).then(function() {
                    $state.reload();
                });
            });
        }
    };

    $scope.editProfile = function(form) {
        UsersService.update($scope.me.profile);
    };
});
