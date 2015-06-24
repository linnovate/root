'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http) {
    var EntityPrefix = '/tasks';

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function getByUserId(id) {
        return $http.get(ApiUri + EntityPrefix + '/user/' + id).then(function(result) {
            return result.data[0];
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

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
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
