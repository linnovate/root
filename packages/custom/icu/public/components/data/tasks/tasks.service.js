'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http) {
    var EnitityPrefix = '/api/tasks';

    function getAll() {
        return $http.get(EnitityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(EnitityPrefix + '/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function getByUserId(id) {
        return $http.get(EnitityPrefix + '/user/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function create(task) {
        return $http.post(EnitityPrefix, task).then(function(result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(EnitityPrefix + '/' + task._id, task).then(function(result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(EnitityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByUserId: getByUserId,
        create: create,
        update: update,
        remove: remove
    };
});
