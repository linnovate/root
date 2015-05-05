'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http) {
    var EnitityPrefix = '/tasks';

    function getAll() {
        return $http.get(ApiUri + EnitityPrefix).then(function(result) {
            return result.data;
        });
    }

    function create(task) {
        return $http.post(ApiUri + EnitityPrefix, task).then(function(result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(ApiUri + EnitityPrefix + '/' + task.id, task).then(function(result) {
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
        create: create,
        update: update,
        remove: remove
    };
});
