'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http) {
    var EntityPrefix = '/projects';

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

    function create(project) {
        return $http.post(ApiUri + EntityPrefix, project).then(function(result) {
            return result.data;
        });
    }

    function update(project) {
        return $http.put(ApiUri + EntityPrefix + '/' + project._id, project).then(function(result) {
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
        create: create,
        update: update,
        remove: remove
    };
});
