'use strict';

angular.module('mean.icu.data.discussionsservice', [])
.service('DiscussionsService', function (ApiUri, $http, PaginationService) {
    var EntityPrefix = '/discussions';

    function getAll() {
        var qs = querystring.encode({
            start: start,
            limit: limit,
            sort: sort
        });

        if (qs.length) {
            qs = '?' + qs;
        }

        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
            return PaginationService.processResponse(result.data);
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            return result.data;
        });
    }

    function getByEntityId(entity) {
        return function(id, start, limit, sort) {
            var qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            return $http.get(ApiUri + '/' + entity + '/' + id + EntityPrefix + qs).then(function(result) {
                return PaginationService.processResponse(result.data);
            });
        }
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
                discussion.star = !discussion.star;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
            return result.data;
        });
    }

    function summary(discussion) {
        return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/summary').then(function(result) {
            return result.data;
        });
    }

    function schedule(discussion) {
        return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/schedule').then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByProjectId: getByEntityId('project'),
        create: create,
        update: update,
        remove: remove,
        star: star,
        getStarred: getStarred,
        schedule: schedule,
        summary: summary
    };
});
