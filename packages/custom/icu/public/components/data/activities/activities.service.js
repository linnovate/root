'use strict';

angular.module('mean.icu.data.activitiesservice', [])
.service('ActivitiesService', function (ApiUri, $http, UsersService) {
    var EntityPrefix = '/updates';

    function getByUserId(id) {
        return [];
    }

    function getUser(updates) {
        return UsersService.getAll().then(function(users) {
            return updates.map(function (u) {
                u.user = _(users).find(function (c) {
                    return c._id === u.creator;
                });
                return u;
            });
        });
    }

    function getByProjectId(id) {
        return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function getByTaskId(id) {
        return $http.get(ApiUri + '/tasks/' + id + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function getByDiscussionId(id) {
        return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function(updatesResult) {
            return getUser(updatesResult.data);
        });
    }

    function create(update) {
        return $http.post(ApiUri + EntityPrefix, update).then(function (result) {
            return result.data;
        });
    }

    return {
        getByUserId: getByUserId,
        getByTaskId: getByTaskId,
        getByProjectId: getByProjectId,
        getByDiscussionId: getByDiscussionId,
        create: create
    };
});
