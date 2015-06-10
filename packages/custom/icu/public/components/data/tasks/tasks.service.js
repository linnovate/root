'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http) {
    var EnitityPrefix = '/tasks';

    function getAll() {
        return $http.get(ApiUri + EnitityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EnitityPrefix + '/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function getByUserId(id) {
        return $http.get(ApiUri + EnitityPrefix + '/user/' + id).then(function(result) {
            return result.data;
        });
    }

    function getByProjectId(id) {
        return $http.get(ApiUri + EnitityPrefix + '/project/' + id).then(function(result) {
            return result.data;
        });
    }

    function create(task) {
        return $http.post(ApiUri + EnitityPrefix, task).then(function(result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(ApiUri + EnitityPrefix + '/' + task._id, task).then(function(result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EnitityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByUserId: getByUserId,
        getByProjectId: getByProjectId,
        create: create,
        update: update,
        remove: remove
    };
});
