'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http) {
    var EntityPrefix = '/api/tasks';

    function getAll() {
        return $http.get(EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(EntityPrefix + '/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function getByUserId(id) {
        return $http.get(EntityPrefix + '/user/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function create(task) {
        console.log('hhhhhh')
        return $http.post(EntityPrefix, task).then(function(result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(EntityPrefix + '/' + task._id, task).then(function(result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(EntityPrefix + '/' + id).then(function(result) {
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
