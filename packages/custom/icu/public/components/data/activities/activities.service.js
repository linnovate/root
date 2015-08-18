'use strict';

angular.module('mean.icu.data.activitiesservice', [])
.service('ActivitiesService', function (ApiUri, $http, UsersService) {
    var EntityPrefix = '/updates';

    function getByUserId(id) {
        return [];
    }

    function getByProjectId(id) {
        return UsersService.getAll().then(function(users) {
            return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function(updatesResult) {
                var updates = updatesResult.data;
                return updates.map(function (u) {
                    u.user = _(users).find(function (c) {
                        return c._id === u.creator;
                    });
                    return u;
                });
            });
        });
    }

    function getByTaskId(id) {
        return UsersService.getAll().then(function(users) {
            return $http.get(ApiUri + '/tasks/' + id + EntityPrefix).then(function(updatesResult) {
                var updates = updatesResult.data;
                return updates.map(function (u) {
                    u.user = _(users).find(function (c) {
                        return c._id === u.creator;
                    });
                    return u;
                });
            });
        });
    }

    function getByDiscussionId(id) {
        return UsersService.getAll().then(function(users) {
            return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function(updatesResult) {
                var updates = updatesResult.data;
                return updates.map(function (u) {
                    u.user = _(users).find(function (c) {
                        return c._id === u.creator;
                    });
                    return u;
                });
            });
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
