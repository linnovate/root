'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http) {
    var EnitityPrefix = '/projects';

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

    function create(project) {
        return $http.post(ApiUri + EnitityPrefix, project).then(function(result) {
            return result.data;
        });
    }

    function update(project) {
        return $http.put(ApiUri + EnitityPrefix + '/' + project._id, project).then(function(result) {
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
        create: create,
        update: update,
        remove: remove
    };
});
