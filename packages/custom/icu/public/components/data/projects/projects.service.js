'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http) {
    var EntityPrefix = '/api/projects';

    function getAll() {
        console.log(EntityPrefix)
        return $http.get(EntityPrefix).then(function(result) {

            return result.data;
        });
    }

    function getById(id) {
        return $http.get(EntityPrefix + '/' + id).then(function(result) {
            return result.data[0];
        });
    }

    function create(project) {
        return $http.post(EntityPrefix, project).then(function(result) {
            return result.data;
        });
    }

    function update(project) {
        return $http.put(EntityPrefix + '/' + project._id, project).then(function(result) {
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
        create: create,
        update: update,
        remove: remove
    };
});
