'use strict';

angular.module('mean.icu.data.officesservice', [])
.service('OfficesService', function(ApiUri, $http, BoldedService, NotifyingService, PaginationService, TasksService, $rootScope, WarningsService, ActivitiesService) {
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
        })
        .then(entity => {
          return BoldedService.boldedUpdate(entity, 'offices', 'update');
        })
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            NotifyingService.notify('editionData');
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function star(office) {
        return $http.patch(ApiUri + EntityPrefix + '/' + office._id + '/star', {star: !office.star})
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                office.star = !office.star;
                return result.data;
            });
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

    function updateWatcher(office, me, watcher, type) {
        return ActivitiesService.create({
            data: {
                issue: 'office',
                issueId: office.id,
                type: type || 'updateWatcher',
                userObj: watcher
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateColor(office, me) {
        return ActivitiesService.create({
            data: {
                issue: 'office',
                issueId: office.id,
                type: 'updateColor',
                status: office.color
            },
            context: {}
        }).then(entity => {
          return BoldedService.boldedUpdate(entity, 'offices', 'update');
        })
    }

    function updateTitle(office, prev, type) {
        var capitalizedType = type[0].toUpperCase() + type.slice(1);
        var activityType = prev[type] ? 'update' + capitalizedType : 'updateNew' + capitalizedType;
        return ActivitiesService.create({
            data: {
                issue: 'office',
                issueId: office.id,
                type: activityType,
                status: office[type],
                prev: prev[type]
            },
            context: {}
        }).then(function(result) {
            return result;
        });
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
        updateWatcher: updateWatcher,
        updateColor: updateColor,
        updateTitle: updateTitle
    };
});
