'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
    .service('OfficeDocumentsService', function ($http, ApiUri, Upload, WarningsService, ActivitiesService) {
        var EntityPrefix = '/officeDocuments';

          function getAll() {
            return $http.get(ApiUri + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                // result.data = [{
                //             created: new Date,
                //             updated: new Date,
                //             _id: "hgjg",
                //             title: "sraya",
                //             path: "/gfdgdgf/dfgdfhg",
                //             description: "hello world",
                //             documentType: "pptx",
                //             entity: "project",
                //             entityId: "fff",
                //             creator: "avraham",
                //             status: "new"
                //                }]
                result.data.forEach(function(officeDocument){
                      officeDocument.created = new Date(officeDocument.created);
                }) 
                       
                return result.data;
            });
        }

         function deleteDocument(id) {
             return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                 return result.status;
             });
         }

        function update(officeDocument) {
            return $http.put(ApiUri + EntityPrefix + '/' + officeDocument._id, officeDocument).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function addSerialTitle(document1){
            return $http.post(ApiUri + EntityPrefix + "/addSerialTitle", document1).then(function (result) {
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

        function getByTaskId(id) {
            return $http.get(ApiUri + '/tasks/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getByProjectId(id) {
            return $http.get(ApiUri + '/projects/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getByDiscussionId(id) {
            return $http.get(ApiUri + '/discussions/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getByOfficeId(id) {
            return $http.get(ApiUri + '/offices/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getByFolderId(id) {
            return $http.get(ApiUri + '/folders/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getByUserId(id) {
            return $http.get(ApiUri + '/users/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function saveDocument(data, file) {    
            return Upload.upload({
                url: '/api/officeDocuments',
                fields: data,
                file: file
            });
        }

        function updateDocument(id, data) {
            return $http.post(ApiUri + EntityPrefix + "/" +id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function update(entity, data) {
            return $http.post(ApiUri + EntityPrefix + "/" +entity._id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function createDocument(data) {
            return $http.post(ApiUri + EntityPrefix + "/create" , data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function uploadFileToDocument(data,file){
            return Upload.upload({
                url: '/api/officeDocuments/uploadFileToDocument',
                fields: data,
                file: file
            });
        }

        function uploadDocumentFromTemplate(template,officeDocument){
            var json={
                'officeDocument':officeDocument,
                'templateDoc':template
            };
            return $http.post(ApiUri + EntityPrefix + "/uploadDocumentFromTemplate" , json).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function star(officeDocument) {
            return $http.patch(ApiUri + EntityPrefix + '/' + officeDocument._id + '/star', {star: !officeDocument.star})
                .then(function (result) {
                    WarningsService.setWarning(result.headers().warning);
                    officeDocument.star = !officeDocument.star;
                    return result.data;
                });
        }

        function getStarred() {
            return $http.get(ApiUri + EntityPrefix + '/starred').then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function updateWatcher(officeDocument, me, watcher, type) {
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: type || 'updateWatcher',
                    userObj: watcher                
                },
                context: {}
            }).then(function(result) {
                return result;
            });
        }

        function updateStatus(officeDocument, prev) {
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: 'updateStatus',
                    status: officeDocument.status,
                    prev: prev.status
                },
                context: {}
            }).then(function(result) {
                return result;
            });
        }

        function updateDue(officeDocument, prev) {
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: 'updateDue',
                    TaskDue: officeDocument.created,
                    prev: prev.created
                },
                context: {}
            }).then(function(result) {
                return result;
            });
        }

        function sendDocument(sendingForm, officeDocument) {
            var data = {
                'sendingForm':sendingForm,
                'officeDocument':officeDocument
            };
            return $http.post(ApiUri + EntityPrefix +  '/sendDocument', data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }
        function updateAssign(officeDocument, prev) {
            if (officeDocument.assign) {
                var activityType = prev.assign ? 'assign' : 'assignNew';
            } else {
                var activityType = 'unassign';
            }
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: activityType,
                    userObj: officeDocument.assign,
                    prev: prev.assign ? prev.assign.name : ''
                },
                context: {}
            }).then(function(result) {
                return result;
            });
        }

        function updateEntity(officeDocument, prev) {
            var activityType = prev.folder ? 'updateEntity' : 'updateNewEntity';
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: activityType,
                    entityType: 'folder',
                    entity: officeDocument.folder.title,
                    prev: prev.folder ? prev.folder.title : ''
                },
                context: {}
            }).then(function(result) {
                return result;
            });

        }

        function updateTitle(officeDocument, prev, type) {
            var capitalizedType = type[0].toUpperCase() + type.slice(1);
            var activityType = prev[type] ? 'update' + capitalizedType : 'updateNew' + capitalizedType;
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument.id,
                    type: activityType,
                    status: officeDocument[type],
                    prev: prev[type]
                },
                context: {}
            }).then(function(result) {
                return result;
            });
        }

        return {
            sendDocument:sendDocument,
            getAll: getAll,
            delete:deleteDocument,
            update: update,
            getById: getById,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveDocument: saveDocument,
            updateDocument: updateDocument,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId,
            star: star,
            getStarred: getStarred,
            createDocument:createDocument,
            uploadFileToDocument:uploadFileToDocument,
            update:update,
            updateWatcher: updateWatcher,
            updateStatus: updateStatus,
            updateDue: updateDue,
            uploadDocumentFromTemplate:uploadDocumentFromTemplate,
            addSerialTitle:addSerialTitle,
            updateAssign: updateAssign,
            updateEntity: updateEntity,
            updateTitle: updateTitle
        };
    });
