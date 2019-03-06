'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function (ApiUri, $http, $stateParams,
                                   BoldedService, NotifyingService, PaginationService, WarningsService,
                                   ActivitiesService) {
    var EntityPrefix = '/tasks';
    var filterValue = false;
    var data = [], tabData, IsNew;

    function getAll(start, limit, sort) {
        var qs = {
            start: start,
            sort: sort
        };
        let paramsId = $stateParams.id;
        qs.limit = findInExistingTasks(paramsId) ? limit : paramsId;
        qs = querystring.encode(qs);

        if (qs.length) {
            qs = '?' + qs;
        }
        // return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        // 	WarningsService.setWarning(result.headers().warning);
        //     return PaginationService.processResponse(result.data);
        // });
        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            data = result.data.content || result.data;
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

    function findInExistingTasks(taskId){
        if(!taskId)return true;
        return !!data.find( taskInList => taskInList._id === taskId );
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

    function relateToTask(taskId, entityType, entityId){
        return $http.post(ApiUri +  EntityPrefix + '/relate', { taskId: taskId, entityType: entityType, entityId: entityId })
          .then(function(result) {
              return result.data
          });
    }

    function getByEntityId(entity) {
        return function(id, start, limit, sort, status, starred) {
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
                let bolded = _.pick(BoldedService.boldedUpdate(entity, 'tasks', 'update'), 'bolded');
                Object.assign(entity, bolded);

                return entity;
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

    function createActivity(updateField){
        return function(entity, me, prev, remove){
            return ActivitiesService.create({
                data: {
                    creator: me,
                    date: new Date(),
                    entity: entity.id,
                    entityType: 'task',

                    updateField: updateField,
                    current: entity[updateField],
                    prev: prev ? prev[updateField] : ''
                },
                context: {}
            }).then(function(result) {
                if (updateField === 'assign' && entity.assign) {
                    var message = {};
                    message.content = entity.title || '-';
                }
                return result;
            });
        }
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
        $http.get(ApiUri+"/tasks/excel",{
            responseType: 'arraybuffer',
        headers:{
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        }}).then(function(data){
            let blob = new Blob([data.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            saveAs(blob,'Summary.xlsx');
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
        getByOfficeDocumentId: getByEntityId('officeDocuments'),
        search: search,
        create: create,
        update: update,
        remove: remove,
        relateToTask: relateToTask,
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
        assign: createActivity('assign'),
        updateDue: createActivity('due'),
        updateStar: createActivity('star'),
        updateTags: createActivity('tags'),
        updateTitle: createActivity('title'),
        updateStatus: createActivity('status'),
        updateWatcher: createActivity('watchers'),
        updateDescription: createActivity('description'),
        data: data,
        tabData: tabData,
        IsNew: IsNew,
        MyTasksOfNextWeekSummary: MyTasksOfNextWeekSummary,
        GivenTasksOfNextWeekSummary: GivenTasksOfNextWeekSummary,
        excel: excel
    };
});
