'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function(ApiUri, $http, ProjectsService) {
    var EntityPrefix = '/tasks';

    function getAll() {
        return $http.get(ApiUri + EntityPrefix).then(function(result) {
            return result.data;
        });
    }

    function getTags() {
        return $http.get(ApiUri + EntityPrefix + '/tags').then(function(result) {
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
            return result.data;
        });
    }

    function getByUserId(id) {
        return $http.get(ApiUri + '/users/' + id + '/tasks').then(function(tasksResult) {
            return tasksResult.data;
        });
    }

    function getByProjectId(id) {
        return ProjectsService.getById(id).then(function(project) {
            return $http.get(ApiUri + '/projects/' + id + '/tasks').then(function(tasksResult) {
                var tasks = tasksResult.data;

                return tasks.map(function(task) {
                    task.project = project;
                    return task;
                });
            });
        });
    }

    function getByDiscussionId(id) {
        return ProjectsService.getAll().then(function(projects) {
            var projectsObj = {};
            for (var i = 0; i < projects.length; i++) {
                projectsObj[projects[i]._id] = projects[i];
            }
            return $http.get(ApiUri + '/discussions/' + id + '/tasks').then(function(tasksResult) {
                var tasks = tasksResult.data;

                return tasks.map(function(task) {
                    task.project = projectsObj[task.project];
                    return task;
                });
            });
        });
    }

    function search(term) {
        return $http.get(ApiUri + '/search?term='+ term +'&index=task').then(function(result) {
            return result.data;
        });
    }

    function create(task) {
        return $http.post(ApiUri + EntityPrefix, task).then(function(result) {
            return result.data;
        });
    }

    function update(task) {
        return $http.put(ApiUri + EntityPrefix + '/' + task._id, task).then(function(result) {
            return result.data;
        });
    }

    function star(task) {
        return $http.patch(EntityPrefix + '/' + task._id, {star: !task.star}).then(function(result) {
            return result.data;
        });
    }

    function getStarred() {
        return $http.get(EntityPrefix + '/starred').then(function(result) {
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
        getTags: getTags,
        getById: getById,
        getByUserId: getByUserId,
        getByProjectId: getByProjectId,
        getByDiscussionId: getByDiscussionId,
        search: search,
        create: create,
        update: update,
        remove: remove,
        getStarred: getStarred,
        star: star
    };
});
