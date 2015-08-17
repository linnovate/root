'use strict';

angular.module('mean.icu.data.discussionsservice', [])
.service('DiscussionsService', function (ApiUri, $http) {
    var EntityPrefix = '/discussions';

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function (result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            return result.data;
        });
    }

    function getByProjectId(id) {
        return getAll().then(function (result) {
            return _(result).filter(function (task) {
                return task.project === id;
            });
        });
    }

    function create(discussion) {
        return $http.post(ApiUri + EntityPrefix, discussion).then(function (result) {
            return result.data;
        });
    }

    function update(discussion) {
        return $http.put(ApiUri + EntityPrefix + '/' + discussion._id, discussion).then(function (result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            return result.data;
        });
    }

    function star(discussion) {
        return $http.patch(ApiUri + EntityPrefix + '/' + discussion._id + '/star', {star: !discussion.star})
            .then(function (result) {
                return result.data;
            });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByProjectId: getByProjectId,
        create: create,
        update: update,
        remove: remove,
        star: star
    };
});
