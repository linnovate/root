'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function (ApiUri, $http, ProjectsService) {
    var EntityPrefix = '/tasks';

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

    function getByUserId(id) {
        return $http.get(ApiUri + '/users/' + id + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getByProjectId(id) {
        return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function (tasksResult) {
            return tasksResult.data;
        });
    }

    function getByDiscussionId(id) {
        return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function (tasksResult) {
            return tasksResult.data;
        });
    }

    function search(term) {
        return $http.get(ApiUri + '/search?term=' + term + '&index=task').then(function (result) {
            return result.data.task || [];
        });
    }

    function create(task) {
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
        return $http.patch(ApiUri + EntityPrefix + '/' + task._id + '/star', {star: !task.star})
            .then(function (result) {
                task.star = !task.star;
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
