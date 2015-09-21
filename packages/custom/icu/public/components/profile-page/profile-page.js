'use strict';

angular.module('mean.icu.ui.profile', [])
.controller('ProfileController', function($scope, $state, me, UsersService) {
    $scope.me = me;

    if (!$scope.me.profile) {
        $scope.me.profile = {};
    }

    $scope.avatar = $scope.me.profile.avatar || 'http://placehold.it/250x250';
    $scope.hash = Math.random();

    $scope.uploadAvatar = function(files) {
        if (files.length) {
            var file = files[0];
            UsersService.updateAvatar(file).success(function(data) {
                $scope.avatar = data.avatar;
                $scope.hash = Math.random();
            });
        }
    };

    $scope.editProfile = function(form) {
        if ($scope.confirm !== $scope.me.password) {
            return;
        }

        UsersService.update($scope.me).then(function() {
            $state.go('main.tasks', null, { reload: true });
        });
    };
});
