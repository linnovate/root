'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http) {
    var EntityPrefix = '/tasks';

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getTags() {
        return ['asdasdas', 'zxczxczxczxc', 'qweqweqweqwe'];
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    function getByUserId(id) {
        return getAll().then(function(result) {
            return _(result).filter(function(task) {
                return task.creator._id === id;
            })
        });
    }

    function getByProjectId(id) {
        return getAll().then(function(result) {
            return _(result).filter(function(task) {
                return task.project === id;
            })
        });
    }

    function create(task) {
        return $http.post(ApiUri + EntityPrefix, task).then(function(result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(ApiUri + EntityPrefix + '/' + task._id, task).then(function(result) {
            return result.data;
        });
    }

    function star(task) {
        return $http.patch(EntityPrefix + '/' + task._id, {star: !task.star}).then(function(result) {
            return result.data;
        });
    }

    function getStarred() {
        return $http.get(EntityPrefix + '/starred').then(function(result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getTags: getTags,
        getById: getById,
        getByUserId: getByUserId,
        getByProjectId: getByProjectId,
        create: create,
        update: update,
        remove: remove,
        getStarred: getStarred,
        star: star
    };
});
