'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function (ApiUri, $http, BoldedService, NotifyingService, PaginationService, WarningsService, ActivitiesService, MeanSocket) {
    var EntityPrefix = '/tasks';
    var filterValue = false;
    var data, tabData, IsNew;

    function getAll(start, limit, sort) {
        var qs = querystring.encode({
            start: start,
            limit: limit,
            sort: sort
        });

        if (qs.length) {
            qs = '?' + qs;
        }
        // return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        // 	WarningsService.setWarning(result.headers().warning);
        //     return PaginationService.processResponse(result.data);
        // });
        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    function getTags() {
        return $http.get(ApiUri + EntityPrefix + '/tags').then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getById(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function removeFromParent(entity){
        return new Promise(function(resolve) {
            if(entity.parent){
                getById(entity.parent)
                    .then(parent=>{
                        var index = parent.subTasks.findIndex(sub=>{
                            return sub._id === entity._id;
                        });
                        parent.subTasks.splice(index, 1);
                        update(parent);
                        return resolve();
                    })
            } else {
                return resolve();
            }
        });
    }

    function addToParent(entity){
        return new Promise(function(resolve) {
            if(entity.parent){
                getById(entity.parent)
                    .then(parent=>{
                        parent.subTasks.push(entity);
                        update(parent);
                        return resolve();
                    })
            } else {
                return resolve();
            }
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

    function search(term) {
        return $http.get(ApiUri + '/search?term=' + term + '&index=task').then(function (result) {
        	  WarningsService.setWarning(result.headers().warning);
            return result.data.task || [];
        });
    }

    function create(task) {
        return $http.post(ApiUri + EntityPrefix, task)
            .then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                NotifyingService.notify('editionData');
                return result.data;
            });
    }

    function update(task, data) {
        if (data) task.frequentUser = data.frequentUser;
        if (task.subTasks && task.subTasks.length && task.subTasks[task.subTasks.length-1] && !task.subTasks[task.subTasks.length-1]._id) {
            var subTask = task.subTasks[task.subTasks.length-1];
        }

        return $http.put(ApiUri + EntityPrefix + '/' + task._id, task)
            .then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                for (var i = 0; i < result.data.subTasks.length; i++) {
                    if(result.data.subTasks[i].due) {
                        result.data.subTasks[i].due = new Date(result.data.subTasks[i].due);
                    }
                }
                if (subTask) result.data.subTasks.push(subTask);
                NotifyingService.notify('editionData');
                return result.data;
            })
            .then(entity => {
                return BoldedService.boldedUpdate(entity, 'tasks', 'update');
            });
    }

    function star(task) {
        return $http.patch(ApiUri + EntityPrefix + '/' + task._id + '/star', {star: !task.star})
            .then(function (result) {
            	  WarningsService.setWarning(result.headers().warning);
                task.star = !task.star;
                return result.data;
            }).then(entity=>{
                return BoldedService.boldedUpdate(entity, 'tasks', 'update');
            });
    }

    function getStarred() {
        return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
        	  WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            NotifyingService.notify('editionData');
        	  WarningsService.setWarning(result.headers().warning);
            return result.data;
        }).then(entity=>{
            return BoldedService.boldedUpdate(entity, 'tasks', 'update');
        });
    }

    function getMyTasks() {
    	return $http.get(ApiUri + EntityPrefix + '/byAssign').then(function (result) {
    		    WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

	function getMyTasksStatistics() {
		return $http.get(ApiUri + '/myTasksStatistics').then(function (result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getOverdueWatchedTasks() {
    	return $http.get(ApiUri + '/overdueWatchedTasks').then(function (result) {
    		    WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getWatchedTasks() {
    	return $http.get(ApiUri + '/watchedTasks').then(function (result) {
    		    WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getStarredByassign() {
        return $http.get(ApiUri + EntityPrefix + '/starred/byAssign').then(function (result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getSubTasks(taskId) {
    	return $http.get(ApiUri + EntityPrefix + '/subtasks/' + taskId).then(function (result) {
    		    WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getTemplate(taskId) {
       return $http.get(ApiUri + '/templates' ).then(function (result) {
       	    WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function saveTemplate(id, name){
        return $http.post(ApiUri + EntityPrefix + '/' + id + '/toTemplate', name).then(function (result) {
        	  WarningsService.setWarning(result.headers().warning);
            return result.data;
        }).then(entity => {
            return BoldedService.boldedUpdate(entity, 'tasks', 'update');
        });
    }

    function template2subTasks(templateId, data){
        return $http.post(ApiUri  + '/templates/' + templateId + '/toSubTasks', data).then(function (result) {
        	  WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function deleteTemplate(id){
        return $http.delete(ApiUri + '/templates/' + id).then(function (result) {
            NotifyingService.notify('editionData');
        	  WarningsService.setWarning(result.headers().warning);
            return result.data;
        }).then(entity=>{
            return BoldedService.boldedUpdate(entity, 'tasks', 'update');
        });
    }

    function updateWatcher(task, me, watcher, type) {
        return ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: type || 'updateWatcher',
                userObj: watcher
            },
            context: {}
        })
          .then(result => {
          return result;
        });
    }

    function updateStatus(task, prev) {
        return ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: 'updateStatus',
                status: task.status,
                prev: prev.status
            },
            context: {}
        }).then(result => {
          return result;
        });
    }

    function updateDue(task, prev) {
        return ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: 'updateDue',
                TaskDue: task.due,
                prev: prev.due
            },
            context: {}
        }).then(function(result) {
            return result;
        });

    }

    function assign(task, me, prev) {
        if (task.assign) {
            var message = {};
            message.content = task.title || '-';
            MeanSocket.emit('message:send', {
                message: message,
                user: me,
                channel: task.assign,
                id: task.id,
                entity: 'task',
                type: 'assign'
            });

            var activityType = prev.assign ? 'assign' : 'assignNew';
        } else {
            var activityType = 'unassign';
        }
        return ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: activityType,
                userObj: task.assign,
                prev: prev.assign ? prev.assign.name : ''
            },
            context: {}
        }).then(result => {
          return result;
        });
    }

    function updateEntity(task, prev) {
        var activityType = prev.project ? 'updateEntity' : 'updateNewEntity';
        return ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: activityType,
                entityType: 'project',
                entity: task.project.title,
                prev: prev.project ? prev.project.title : ''
            },
            context: {}
        }).then(result => {
          return result;
        });

    }

    function updateTitle(task, prev, type) {
        var capitalizedType = type[0].toUpperCase() + type.slice(1);
        var activityType = prev[type] ? 'update' + capitalizedType : 'updateNew' + capitalizedType;
        return ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: activityType,
                status: task[type],
                prev: prev[type]
            },
            context: {}
        }).then(function(result) {
            return result;
        });
    }

    function MyTasksOfNextWeekSummary() {
        return $http.post(ApiUri + EntityPrefix + '/MyTasksOfNextWeekSummary').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function GivenTasksOfNextWeekSummary() {
        return $http.post(ApiUri + EntityPrefix + '/GivenTasksOfNextWeekSummary').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function excel() {
        var qs = querystring.encode({
            start: 0,
            limit: 0,
            sort: "created"
        });

        if (qs.length) {
            qs = '?' + qs;
        }
        return $http.get(ApiUri + EntityPrefix + '/excel' + qs).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    return {
        addToParent: addToParent,
        removeFromParent: removeFromParent,
        getAll: getAll,
        getTags: getTags,
        getById: getById,
        getByUserId: getByEntityId('users'),
        getByProjectId: getByEntityId('projects'),
        getByDiscussionId: getByEntityId('discussions'),
        getByOfficeId: getByEntityId('offices'),
        getByFolderId: getByEntityId('folders'),
        search: search,
        create: create,
        update: update,
        remove: remove,
        getStarred: getStarred,
        star: star,
        getMyTasks: getMyTasks,
        getMyTasksStatistics: getMyTasksStatistics,
        getOverdueWatchedTasks: getOverdueWatchedTasks,
        getWatchedTasks: getWatchedTasks,
        getStarredByassign: getStarredByassign,
        getSubTasks: getSubTasks,
        getTemplate: getTemplate,
        filterValue: filterValue,
        saveTemplate: saveTemplate,
        template2subTasks:template2subTasks,
        deleteTemplate: deleteTemplate,
        assign: assign,
        updateDue: updateDue,
        updateStatus: updateStatus,
        updateWatcher: updateWatcher,
        data: data,
        tabData: tabData,
        IsNew: IsNew,
        updateEntity: updateEntity,
        updateTitle: updateTitle,
        MyTasksOfNextWeekSummary: MyTasksOfNextWeekSummary,
        GivenTasksOfNextWeekSummary: GivenTasksOfNextWeekSummary,
        excel: excel
    };
});
