'use strict';

angular.module('mean.icu.ui.avatar', [])
    .directive('icuAvatar', ['PermissionsService',function (PermissionsService) {

        function controller($scope) {
            $scope.imgUrl = '?' + Date.now();

            $scope.haveEditiorsPermissions = function (entity, user) {
                if(entity)return PermissionsService.haveEditorsPerms(entity, user);
            };
        }

        return {
            restrict: 'A',
            scope: {
              user: '=',
              entity: '=',
            },
            templateUrl: '/icu/components/avatar/avatar.html',
            controller: controller
        };
    }]);
