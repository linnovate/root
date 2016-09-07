'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http, PaginationService, TasksService) {
    var EntityPrefix = '/projects';
    var data;

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
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
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
                return PaginationService.processResponse(result.data);
            });
        }
    }

    function create(project) {
        return $http.post(ApiUri + EntityPrefix, project).then(function(result) {
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
            if(TasksService.data) {
                TasksService.data.forEach(function(task) {
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
            return result.data;
        });
    }

    function star(project) {
        return $http.patch(ApiUri + EntityPrefix + '/' + project._id + '/star', {star: !project.star})
            .then(function (result) {
                project.star = !project.star;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
            return result.data;
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
        data: data
    };
});
