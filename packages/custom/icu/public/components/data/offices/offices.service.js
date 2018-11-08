'use strict';

angular.module('mean.icu.data.officesservice', [])
.service('OfficesService', function(ApiUri, $http, BoldedService, NotifyingService, PaginationService, TasksService, $rootScope, WarningsService, ActivitiesService, MeanSocket) {
    var EntityPrefix = '/offices';
    var data, selected;

    function getAll(start, limit, sort) {
        var qs = querystring.encode({
            start: start,
            limit: limit,
            sort: sort
        });

        if (qs.length) {
            qs = '?' + qs;
        }
        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getByEntityId(entity) {
        return function(id, start, limit, sort, starred) {
            var qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            var url = ApiUri + '/' + entity + '/' + id + EntityPrefix;
            if (starred) {
                url += '/starred';
            }

            return $http.get(url + qs).then(function(result) {
            	WarningsService.setWarning(result.headers().warning);
                return PaginationService.processResponse(result.data);
            });
        }
    }

    function create(office) {
        return $http.post(ApiUri + EntityPrefix, office).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            NotifyingService.notify('editionData');
            return result.data;
        });
    }


    function update(office, context, watcherAction, watcherId) {
        context = context || {};
        if (!context.action) {
            context.action = 'updated';
        }
        if (!context.type) {
            context.type = 'office';
        }
        office.watcherAction = watcherAction;
        office.watcherId = watcherId;
        return $http.put(ApiUri + EntityPrefix + '/' + office._id, office).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            if(TasksService.data) {
                TasksService.data.forEach(function(task) {
                    if (task.office && task.office._id === office._id) {
                        task.office = result.data;
                    }
                });
            }
            if(TasksService.tabData) {
                TasksService.tabData.forEach(function(task) {
                    if (task.office && task.office._id === office._id) {
                        task.office = result.data;
                    }
                });
            }
            return result.data;
        }).then(entity => BoldedService.boldedUpdate(entity, 'offices', 'update'));
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            NotifyingService.notify('editionData');
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        }).then(entity => BoldedService.boldedUpdate(entity, 'offices', 'update'));
    }

    function star(office) {
        return $http.patch(ApiUri + EntityPrefix + '/' + office._id + '/star', {star: !office.star})
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                office.star = !office.star;
                return result.data;
            }).then(entity => BoldedService.boldedUpdate(entity, 'offices', 'update'));
    }

    function WantToCreateRoom(office) {
        return $http.post(ApiUri + EntityPrefix + '/' + office._id + '/WantToCreateRoom', office)
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                office.WantToCreateRoom = !office.WantToCreateRoom;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function createActivity(updateField){
        return function(entity, me, prev){
            return ActivitiesService.create({
                data: {
                    creator: me,
                    date: new Date(),
                    entity: entity.id,
                    entityType: 'office',

                    updateField: updateField,
                    current: entity[updateField],
                    prev: prev[updateField]
                },
                context: {}
            }).then(function(result) {
                if (updateField === 'assign' && entity.assign) {
                    var message = {};
                    message.content = entity.title || '-';
                    MeanSocket.emit('message:send', {
                        message: message,
                        user: me,
                        channel: entity.assign,
                        id: entity.id,
                        entity: 'office',
                        type: 'assign'
                    });
                }
                return result;
            });
        }
    }

    return {
        getAll: getAll,
        getById: getById,
        getByDiscussionId: getByEntityId('discussions'),
        getByUserId: getByEntityId('users'),
        getByOfficeId: getByEntityId('offices'),
        getByFolderId: getByEntityId('folders'),
        create: create,
        update: update,
        remove: remove,
        star: star,
        getStarred: getStarred,
        data: data,
        selected: selected,
        WantToCreateRoom: WantToCreateRoom,
        updateColor: createActivity('color'),
        updateTitle: createActivity('title'),
        updateWatcher: createActivity('watchers')
    };
});
