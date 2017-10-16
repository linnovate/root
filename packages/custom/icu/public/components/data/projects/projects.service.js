'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http, PaginationService, TasksService, $rootScope, WarningsService, ActivitiesService) {
    var EntityPrefix = '/projects';
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
        	console.log($rootScope.warning, '$rootScope.warning')
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

    function create(project) {
        return $http.post(ApiUri + EntityPrefix, project).then(function(result) {

        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }


    function update(project, context) {
        context = context || {};
        if (!context.action) {
            context.action = 'updated';
        }
        if (!context.type) {
            context.type = 'project';
        }

        return $http.put(ApiUri + EntityPrefix + '/' + project._id, project).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            if(TasksService.data) {
                TasksService.data.forEach(function(task) {
                    if (task.project && task.project._id === project._id) {
                        task.project = result.data;
                    }
                });
            }
            if(TasksService.tabData) {
                TasksService.tabData.forEach(function(task) {
                    if (task.project && task.project._id === project._id) {
                        task.project = result.data;
                    }
                });
            }
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function star(project) {
        return $http.patch(ApiUri + EntityPrefix + '/' + project._id + '/star', {star: !project.star})
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                project.star = !project.star;
                return result.data;
            });
    }

    function WantToCreateRoom(project) {
        return $http.post(ApiUri + EntityPrefix + '/' + project._id + '/WantToCreateRoom', project)
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                project.WantToCreateRoom = !project.WantToCreateRoom;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    // update activities
    function updateWatcher(project, me, watcher, type) {
        return ActivitiesService.create({
            data: {
                issue: 'project',
                issueId: project.id,
                type: type || 'updateWatcher',
                userObj: watcher                
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateStatus(project, prev) {
        return ActivitiesService.create({
            data: {
                issue: 'project',
                issueId: project.id,
                type: 'updateStatus',
                status: project.status,
                prev: prev.status
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }


    function updateColor(project, me) {
        return ActivitiesService.create({
            data: {
                issue: 'project',
                issueId: project.id,
                type: 'updateColor',
                status: project.color
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
        create: create,
        update: update,
        remove: remove,
        star: star,
        getStarred: getStarred,
        data: data,
        selected: selected,
        WantToCreateRoom: WantToCreateRoom,
        updateWatcher: updateWatcher,
        updateStatus: updateStatus,
        updateColor: updateColor
    };
});
