'use strict';

angular.module('mean.icu.data.discussionsservice', [])
.service('DiscussionsService', function (ApiUri, $http, PaginationService, WarningsService, ActivitiesService) {
    var EntityPrefix = '/discussions';
    var data;

    function getAll(start, limit, sort) {
        var qs = querystring.encode({
            start: start,
            limit: limit,
            sort: sort
        });

        if (qs.length) {
            qs = '?' + qs;
        }

        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getByEntityId(entity) {
        return function(id, start, limit, sort, starred) {
            var qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if (qs.length) {
                qs = '?' + qs;
            }

            var url = ApiUri + '/' + entity + '/' + id + EntityPrefix;
            if (starred) {
                url += '/starred';
            }

            return $http.get(url + qs).then(function(result) {
            	WarningsService.setWarning(result.headers().warning);
                return PaginationService.processResponse(result.data);
            });
        }
    }

    function create(discussion) {
        return $http.post(ApiUri + EntityPrefix, discussion).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function update(discussion) {
        return $http.put(ApiUri + EntityPrefix + '/' + discussion._id, discussion).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function star(discussion) {
        return $http.patch(ApiUri + EntityPrefix + '/' + discussion._id + '/star', {star: !discussion.star})
            .then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                discussion.star = !discussion.star;
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function summary(discussion) {
        return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/summary').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function schedule(discussion) {
        return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/schedule').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function cancele(discussion) {
        return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/cancele').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function updateWatcher(discussion, me, watcher, type) {
        return ActivitiesService.create({
            data: {
                issue: 'discussion',
                issueId: discussion.id,
                type: type || 'updateWatcher',
                userObj: watcher                
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateStatus(discussion, prev) {
        return ActivitiesService.create({
            data: {
                issue: 'discussion',
                issueId: discussion.id,
                type: 'updateStatus',
                status: discussion.status,
                prev: prev.status
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateDue(discussion, prev, type) {
        return ActivitiesService.create({
            data: {
                issue: 'discussion',
                issueId: discussion.id,
                type: 'update' + type[0].toUpperCase() + type.slice(1),
                TaskDue: type === 'startDue' ? discussion.startDate : discussion.endDate,
                prev: type === 'startDue' ? prev.startDate : prev.endDate
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateLocation(discussion, prev) {
        var activityType = prev.location ? 'updateLocation' : 'updateNewLocation';
        return ActivitiesService.create({
            data: {
                issue: 'discussion',
                issueId: discussion.id,
                type: activityType,
                status: discussion.location,
                prev: prev.location
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function updateAssign(discussion, prev) {
        if (discussion.assign) {
            var activityType = prev.assign ? 'assign' : 'assignNew';
        } else {
            var activityType = 'unassign';
        }
        return ActivitiesService.create({
            data: {
                issue: 'discussion',
                issueId: discussion.id,
                type: activityType,
                userObj: discussion.assign,
                prev: prev.assign ? prev.assign.name : ''
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    return {
        getAll: getAll,
        getById: getById,
        getByProjectId: getByEntityId('projects'),
        create: create,
        update: update,
        remove: remove,
        star: star,
        getStarred: getStarred,
        schedule: schedule,
        summary: summary,
        data: data,
        cancele: cancele,
        updateWatcher: updateWatcher,
        updateStatus: updateStatus,
        updateDue: updateDue,
        updateLocation: updateLocation,
        updateAssign: updateAssign
    };
});
