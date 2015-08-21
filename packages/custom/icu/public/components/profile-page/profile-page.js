'use strict';

angular.module('mean.icu.ui.profile', [])
.controller('ProfileController', function($scope, $state, me, UsersService) {
    $scope.me = me;
    $scope.avatar = $scope.me.profile.avatar || 'http://placehold.it/250x250';
    $scope.hash = new Date().getTime();

    $scope.uploadAvatar = function(files) {
        if (files) {
            var file = files[0];
            UsersService.updateAvatar(file).success(function(data) {
                $scope.me.profile.avatar = data.avatar;

                $state.reload();
            });
        }
    };

    $scope.editProfile = function(form) {
        if ($scope.confirm !== $scope.me.password) {
            return;
        }

        UsersService.update($scope.me).then(function() {
            $state.reload();
        });
    };
});
