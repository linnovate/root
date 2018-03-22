'use strict';

angular.module('mean.icu.data.permissionsservice', [])
    .service('PermissionsService', function(ApiUri, $http, NotifyingService,UsersService, PaginationService, MeanSocket, TasksService, $rootScope, WarningsService, ActivitiesService) {
        var EntityPrefix = '/permissions';
        var me = UsersService.getMe().$$state.value;

        var editorPerms = {
            'summary' : true,
            'description' : true,
            'tabs' : true,
            'tab-content' : true,
            'watchers' : true,
        };

        var commenterPerms = {
            'summary' : false,
            'description' : false,
            'tabs' : true,
            'tab-content' : true,
            'watchers' : false,
        };

        var viewerPerms = {
            'summary' : false,
            'description' : false,
            'tabs' : true,
            'tab-content' : false,
            'watchers' : false,
        };

        function permissionsToSee(entity){
            var perms = false;
            for(var prop in entity) {
                if (prop === me._id) {
                    perms = true;
                }
            }
            return perms;
        }

        function haveEditorPermissions(entity, user){
            var member = user || me;
            var userPermission = _.find(entity.permissions, {'id': member._id});
            return userPermission.level == 'editor';
        }

        function permissions(entity, type) {
            var qs = querystring.encode({
                user: me,
                type: type,
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            //untill permissions backend route isn't complete
            var havePerm = false;

            var currentUserPermissions = (_.find(entity.permissions, {'id':me._id})).level;
            switch (currentUserPermissions){
                case 'editor': havePerm =  editorPerms[type];
                    break;
                case 'commenter': havePerm = commenterPerms[type];
                    break;
                case 'viewer': havePerm = viewerPerms[type];
                    break;
            }
            return havePerm;
            // return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
            //     WarningsService.setWarning(result.headers().warning);
            //     return result.data;
            // }, function(err) {return err})
            //     .then(function (perms) {return perms});
        }
        return {
            canSee: permissionsToSee,
            havePermissions: permissions,
            haveEditorPerms: haveEditorPermissions,
        };
    });
