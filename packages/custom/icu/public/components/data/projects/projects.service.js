'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function(ApiUri, $http) {
    var EntityPrefix = '/projects';

    function getNew () {
        return [];
    }

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

    function getByDiscussionId(id) {
        return getAll();
        //return $http.get(ApiUri + '/discussion/' + id + EntityPrefix).then(function (discussionsResult) {
        //    return discussionsResult.data;
        //});
    }

    function getByUserId(id) {
        return $http.get(ApiUri + '/users/' + id + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function create(project) {
        var projectData = _(project).omit(function(value, key) {
            return key.indexOf('__') === 0;
        });

        return $http.post(ApiUri + EntityPrefix, projectData).then(function(result) {
            _(project).assign(result.data);

            return result.data;
        });
    }

    function update(project, context) {
        project = _(project).omit(function(value, key) {
            return key.indexOf('__') === 0;

        });
        if(!context.action)
            context.action = 'updated';
        if(!context.type)
            context.type =  'project'

        return $http.put(ApiUri + EntityPrefix + '/' + project._id, {project:  project, context: context}).then(function(result) {
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    function star(discussion) {
        return $http.patch(ApiUri + EntityPrefix + '/' + discussion._id + '/star', {star: !discussion.star})
            .then(function (result) {
                return result.data;
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
            return result.data;
        });
    }

    return {
        getNew: getNew,
        getAll: getAll,
        getById: getById,
        getByDiscussionId: getByDiscussionId,
        getByUserId: getByUserId,
        create: create,
        update: update,
        remove: remove,
        star: star,
        getStarred: getStarred
    };
});
