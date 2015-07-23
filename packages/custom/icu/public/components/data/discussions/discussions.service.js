'use strict';

angular.module('mean.icu.data.discussionsservice', [])
.service('DiscussionsService', function(ApiUri, $http) {
    var EntityPrefix = '/discussions';

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    function getByProjectId(id) {
        return getAll().then(function(result) {
            return _(result).filter(function(task) {
                return task.project === id;
            })
        });
    }

    function create(discussions) {
        return $http.post(ApiUri + EntityPrefix, discussions).then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByProjectId: getByProjectId,
        create: create
    };
});
