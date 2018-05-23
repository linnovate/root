'use strict';

angular.module('mean.icu.ui.profile', [])
.controller('ProfileController', function($scope, $state, me, UsersService, $http) {
    $scope.me = me;
    $scope.me.fullname = $scope.me.name + " " + $scope.me.lastname;
    $scope.needToBeIgnored = false;

    if (!$scope.me.GetMailEveryWeekAboutMyTasks) {
        $scope.me.GetMailEveryWeekAboutMyTasks="no";
    }

    if (!$scope.me.GetMailEveryWeekAboutMyTasks) {
        $scope.me.GetMailEveryWeekAboutGivenTasks="no";
    }

    if (!$scope.me.GetMailEveryDayAboutMyTasks) {
        $scope.me.GetMailEveryDayAboutMyTasks="no";
    }

    if (!$scope.me.profile) {
        $scope.me.profile = {};
    }

    $scope.GoToMyTasks = function() {
        $state.go('main.tasks.byassign');
    }

    $scope.avatar = $scope.me.profile.avatar || 'http://placehold.it/250x250';
    $scope.hash = Math.random();

    $scope.uploadAvatar = function(files) {
        if (files.length) {
            var file = files[0];
            UsersService.updateAvatar(file)
                .success(function(data) {
                    $scope.avatar = data.avatar;
                    $scope.hash = Math.random();
                    $scope.me.profile.avatar = data.avatar;
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

    $scope.loginToHi = function(username, password) {
        UsersService.loginToHi(username, password).then(function(result) {
            if (result.result.status === 'success') {
                $scope.me.profile.hiUid = result.result.data.userId;
            }
        })
    };
});
