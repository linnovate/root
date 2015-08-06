'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function (ApiUri, $http, $q, ProjectsService) {
    var EntityPrefix = '/tasks';

    var clientEntities = {};

    function getNew(projectId) {
        var clientId = Math.floor(Math.random() * 1000000000);
        var entity = {
            _id: clientId,
            title: '',
            description: '',
            project: projectId,
            tags: [],
            watchers: []
        };

        ProjectsService.getById(projectId).then(function(project) {
            entity.project = project;
        });

        clientEntities[clientId] = entity;

        return entity;
    }

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function (result) {
            return result.data;
        });
    }

    function getTags() {
        return $http.get(ApiUri + EntityPrefix + '/tags').then(function (result) {
            return result.data;
        });
    }

    function getById(id) {
        var deffered = $q.defer();

        if (clientEntities[id]) {
            deffered.resolve(clientEntities[id]);

            return deffered.promise;
        } else {
            return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                var task = result.data;

                return getStarred().then(function(starred) {
                    task.star = _(starred).any(function(s) {
                        return s._id === task._id;
                    });

                    return task;
                });
            });
        }
    }

    function getByUserId(id) {
        return $http.get(ApiUri + '/users/' + id + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getByProjectId(id) {
        return ProjectsService.getById(id).then(function(project) {
            return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function(tasksResult) {
                var tasks = tasksResult.data;

                return tasks.map(function (task) {
                    task.project = project;
                    return task;
                });
            });
        });
    }

    function getByDiscussionId(id) {
        return ProjectsService.getAll().then(function(projects) {
            return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function(tasksResult) {
                var tasks = tasksResult.data;
                return tasks.map(function (t) {
                    t.project = _(projects).find(function (p) {
                        return p._id === t.project;
                    });
                    return t;
                });
            });
        });
    }

    function search(term) {
        return $http.get(ApiUri + '/search?term=' + term + '&index=task').then(function (result) {
            return result.data;
        });
    }

    function create(task) {
        var entity = clientEntities[task._id];
        if (entity) {
            delete task._id;
            delete clientEntities[task._id];
        }

        return $http.post(ApiUri + EntityPrefix, task).then(function (result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(ApiUri + EntityPrefix + '/' + task._id, task).then(function (result) {
            return result.data;
        });
    }

    function star(task) {
        return $http.patch(ApiUri + EntityPrefix + '/' + task._id + '/star', { star: !task.star }).then(function(result) {
            return result.data;
        });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            return result.data;
        });
    }

    return {
        getNew: getNew,
        getAll: getAll,
        getTags: getTags,
        getById: getById,
        getByUserId: getByUserId,
        getByProjectId: getByProjectId,
        getByDiscussionId: getByDiscussionId,
        search: search,
        create: create,
        update: update,
        remove: remove,
        getStarred: getStarred,
        star: star
    };
});
