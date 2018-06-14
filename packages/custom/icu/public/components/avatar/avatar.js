'use strict';

angular.module('mean.icu.ui.avatar', [])
    .directive('icuAvatar', ['PermissionsService',function (PermissionsService) {

        function controller($scope) {
            $scope.imgUrl = '?' + Date.now();

            $scope.haveEditiorsPermissions = function (entity, user) {
                if(entity)return PermissionsService.haveEditorsPerms(entity, user);
            };

            $scope.isCommenter = function (entity, user) {
                if(entity)return PermissionsService.haveCommenterPerms(entity, user);
            };
            $scope.getUserClass = function (entity, user) {
                if (entity) {
                    let userPermissions = PermissionsService.getUserPerms(entity, user);
                    switch (userPermissions && userPermissions.level) {
                        case 'editor' :
                            return 'editor';
                        case 'commenter' :
                            return 'commenter';
                        default:
                            return 'viewer';
                    }
                }
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
