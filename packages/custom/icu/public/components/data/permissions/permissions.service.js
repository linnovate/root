'use strict';

angular.module('mean.icu.data.permissionsservice', [])
    .service('PermissionsService', function(ApiUri, $http, NotifyingService,UsersService,DiscussionsService, TasksService, ProjectsService, PaginationService, MeanSocket, $rootScope, WarningsService, ActivitiesService) {
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

        function permissionsToSee(entity, user) {
            var perms = false;
            for (var prop in entity) {
                if (prop === (user._id || me._id)) {
                    perms = true;
                }
            }
            return perms;
        }

        function getPermissionStatus(user, entity) {
            if(!user)return false;
            var usersPerms = _.find(entity.permissions, {'id': user._id});
            if(!usersPerms)return false;
            switch (usersPerms.level) {
                case 'editor':
                    user.premissionStatus = 'editor';
                    break;
                case 'commenter':
                    user.premissionStatus = 'commenter';
                    break;
                case 'viewer':
                    user.premissionStatus = 'viewer';
                    break;
            }
            return user;
        }

        function updateEntity(entity, context) {
            var entityService = (context.main === 'tasks' ?  TasksService :  ProjectsService);
            var backupEntity = JSON.parse(JSON.stringify(entity));

            if (context.main !== 'discussions') {
                entityService.update(entity).then(function (result) {
                    if (context.entityName === 'project') {
                        var projId = result.project ? result.project._id : undefined;
                        if (projId !== context.entityId) {
                            $state.go('main.' + context.main + '.byentity', {
                                entity: context.entityName,
                                entityId: context.entityId
                            }, {
                                reload: true
                            });
                        }
                    }
                });

                entityService.assign(entity, me, backupEntity).then(function (res) {
                    // backup for previous changes - for updates
                    ActivitiesService.data.push(res);
                });
            } else {
                DiscussionsService.update(entity);
                if (entity.assign !== undefined || entity.assign !== null) {

                    let filtered = entity.watchers.filter(watcher => {
                        // check the assignee is not a watcher already
                        return watcher === entity.assign;
                    });

                    // add assignee as watcher
                    if (filtered.length === 0) {
                        entity.watchers.push(entity.assign);
                    }
                }

                DiscussionsService.updateAssign(entity, backupEntity).then(function (result) {
                    backupEntity = JSON.parse(JSON.stringify(entity));
                    ActivitiesService.data = ActivitiesService.data || [];
                    ActivitiesService.data.push(result);
                });
            }
        }

        function updateEntityPermission(entity, context) {
            var statuses = ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'];

            entity.status = statuses[1];
            if (context.entityName === 'discussion') {
                entity.discussion = context.entityId;
            }

            if (entity.assign === undefined || entity.assign === null) {
                delete entity.assign;
            } else {

                // check the assignee is not a watcher already
                let filtered = entity.watchers.filter(watcher => {
                    return watcher._id === entity.assign;
                });

                // add assignee as watcher
                if (filtered.length === 0) {
                    entity.watchers.push(entity.assign);
                }
            }
            updateEntity(entity, context);
        }

        function permissions(entity, type, user) {
            var member = user || me;

            var qs = querystring.encode({
                user: me,
                type: type,
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            //untill permissions backend route isn't complete
            var have_perm = false;

            var usersPerms = _.find(entity.permissions, {'id': member._id});
            switch (usersPerms.level) {
                case 'editor': have_perm = editorPerms[type];
                    break;
                case 'commenter': have_perm = commenterPerms[type];
                    break;
                case 'viewer': have_perm = viewerPerms[type];
                    break;
            }
            return have_perm;
            // return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
            //     WarningsService.setWarning(result.headers().warning);
            //     return result.data;
            // }, function(err) {return err})
            //     .then(function (perms) {return perms});
        }
        return {
            canSee: permissionsToSee,
            havePermissions: permissions,
            getPermissionStatus: getPermissionStatus,
            updateEntityPermission: updateEntityPermission,
        };
    });
