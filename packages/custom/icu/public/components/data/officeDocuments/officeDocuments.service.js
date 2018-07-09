'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
    .service('OfficeDocumentsService', function ($http, ApiUri, Upload, WarningsService, NotifyingService, ActivitiesService) {
        var EntityPrefix = '/officeDocuments';

        function getAll(start, limit, sort, sortOrder, status, folderId) {
            var query = "/?start=0&limit=25&sort=created";
            if (start && limit && sort) {
                query = "/?start=" + start + "&limit=" + limit + "&sort=" + sort;
            }
            if (status) {
                query = "/?start=" + start + "&limit=" + limit + "&sort=" + sort + "&sortOrder=" + sortOrder + "&status=" + status;
            }
            if (folderId) {
                query = "/?start=" + start + "&limit=" + limit + "&sort=" + sort + "&sortOrder=" + sortOrder + "&status=" + status + "&folderId=" + folderId;
            }
            return $http.get(ApiUri + EntityPrefix + query).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                result.data.forEach(function (officeDocument) {
                    officeDocument.created = new Date(officeDocument.created);
                });

                return result.data;
            });
        }

        function deleteDocument(id) {
            return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                NotifyingService.notify('editionData');
                return result.status;
            });
        }

        function deleteDocumentFile(id) {
            return $http.post(ApiUri + EntityPrefix + '/deleteDocumentFile/' + id).then(function (result) {
                return result.status;
            });
        }


        function addSerialTitle(document1) {
            return $http.post(ApiUri + EntityPrefix + "/addSerialTitle", document1).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function signOnDocx(document1, signature) {
            var json = {
                'document': document1,
                'signature': signature
            };
            return $http.post(ApiUri + EntityPrefix + "/signOnDocx", json).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getById(id) {
            return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                result.data.created = new Date(result.data.created);
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
                result.data.forEach(function (officeDocument) {
                    officeDocument.created = new Date(officeDocument.created);
                });
                return result.data;
            });
        }

        function getByFolderId(id) {
            return $http.get(ApiUri + '/folders/' + id + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);

                result.data.forEach(function (officeDocument) {
                    officeDocument.created = new Date(officeDocument.created);
                });

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

        function download(data, fileName) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute('style', 'display:none');
            var blob = new Blob([new Uint8Array(data)]);
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            setTimeout(function () {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 0);
        }

        function getFileFtp(url) {
            return $http({ method: 'GET', url: ApiUri + "/ftp/" + url }).then(function (response) {
                var json = response.data;
                var fileContent = json.fileContent.data;
                var fileName = json.fileName;
                download(fileContent, fileName);
                return response;
            }, function (errorResponse) {
                console.dir("ERROR RESPOSE");
                console.dir(errorResponse);
                return errorResponse;
            });
        }

        // // updates specific data document
        // function updateDocument(id, data) {
        //     return $http.post(ApiUri + EntityPrefix + "/" + id, data).then(function (result) {
        //         WarningsService.setWarning(result.headers().warning);
        //         return result.data;
        //     });
        // }

        // updates entire document
        function update(entity, action = null) {
            return $http.put(ApiUri + EntityPrefix + "/" + entity._id, entity).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }


        function createDocument(data) {
            console.log("createDocument", data);
            return $http.post(ApiUri + EntityPrefix, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                NotifyingService.notify('editionData');
                return result.data;
            });
        }



        function uploadFileToDocument(data, file) {
            return Upload.upload({
                url: '/api/officeDocuments/uploadFileToDocument',
                fields: data,
                file: file
            });
        }

        function uploadDocumentFromTemplate(template, officeDocument) {
            var json = {
                'officeDocument': officeDocument,
                'templateDoc': template
            };
            return $http.post(ApiUri + EntityPrefix + "/uploadDocumentFromTemplate", json).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function star(officeDocument) {
            return $http.patch(ApiUri + EntityPrefix + '/' + officeDocument._id + '/star', { star: !officeDocument.star })
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
            console.log("OfficeDocumentsService.updateWatcher", officeDocument, me, watcher, type)
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: type || 'updateWatcher',
                    userObj: watcher
                },
                context: {}
            }).then(function (result) {
                return result;
            });
        }

        function updateWatcherPerms(officeDocument, me, watcher, type) {
            console.log("OfficeDocumentsService.updateWatcherPerms", officeDocument, me, watcher, type)

            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: 'updateWatcherPerms',
                    userObj: watcher,
                    permissions: officeDocument.permissions
                },
                context: {}
            }).then(function (result) {
                return result;
            });
        }

        function updateStatus(officeDocument, prev) {
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocument',
                    issueId: officeDocument._id,
                    type: 'updateStatus',
                    status: officeDocument.status,
                    prev: prev.status
                },
                context: {}
            }).then(function (result) {
                return result;
            });
        }

        function uploadEmpty(officeDocument) {
            return $http.post(ApiUri + EntityPrefix + "/uploadEmpty", officeDocument).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function updateDue(officeDocument, prev) {
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: 'updateCreated',
                    TaskDue: officeDocument.created,
                    prev: prev.created
                },
                context: {}
            }).then(function (result) {
                return result;
            });
        }

        function sendDocument(sendingForm, officeDocument) {
            var data = {
                'sendingForm': sendingForm,
                'officeDocument': officeDocument
            };
            return $http.post(ApiUri + EntityPrefix + '/sendDocument', data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function receiveDocument(officeDocument) {
            var data = {
                'officeDocument': officeDocument
            };
            return $http.post(ApiUri + EntityPrefix + '/receiveDocument/' + officeDocument._id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function distributedDocument(officeDocument) {
            var data = {
                'officeDocument': officeDocument
            };
            return $http.post(ApiUri + EntityPrefix + '/distributedDocument/' + officeDocument._id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function readByDocument(officeDocument) {
            var data = {
                'officeDocument': officeDocument
            };
            return $http.post(ApiUri + EntityPrefix + '/readByDocument/' + officeDocument._id, data).then(function (result) {
                return result.data;
            });
        }

        function sentToDocument(officeDocument) {
            var data = {
                'officeDocument': officeDocument
            };
            return $http.post(ApiUri + EntityPrefix + '/sentToDocument/' + officeDocument._id, data).then(function (result) {
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
            }).then(function (result) {
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
            }).then(function (result) {
                return result;
            });

        }

        function updateTitle(officeDocument, prev, type) {
            var capitalizedType = type[0].toUpperCase() + type.slice(1);
            var activityType = prev[type] ? 'update' + capitalizedType : 'updateNew' + capitalizedType;
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: activityType,
                    status: officeDocument[type],
                    prev: prev[type]
                },
                context: {}
            }).then(function (result) {
                return result;
            });
        }

        return {
            sendDocument: sendDocument,
            getAll: getAll,
            delete: deleteDocument,
            update: update,
            getById: getById,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveDocument: saveDocument,
            update: update,
//            updateDocument: updateDocument,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId,
            star: star,
            getStarred: getStarred,
            createDocument: createDocument,
            receiveDocument, receiveDocument,
            distributedDocument, distributedDocument,
            readByDocument, readByDocument,
            sentToDocument, sentToDocument,
            uploadFileToDocument: uploadFileToDocument,
            updateWatcher: updateWatcher,
            updateWatcherPerms: updateWatcherPerms,
            updateStatus: updateStatus,
            updateDue: updateDue,
            uploadDocumentFromTemplate: uploadDocumentFromTemplate,
            addSerialTitle: addSerialTitle,
            updateAssign: updateAssign,
            updateEntity: updateEntity,
            updateTitle: updateTitle,
            uploadEmpty: uploadEmpty,
            deleteDocumentFile: deleteDocumentFile,
            signOnDocx: signOnDocx,
            getFileFtp: getFileFtp
        };
    });
