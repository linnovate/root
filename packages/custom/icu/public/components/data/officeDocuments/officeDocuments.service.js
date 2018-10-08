'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
    .service('OfficeDocumentsService', function ($http, ApiUri, Upload, PaginationService, BoldedService, WarningsService, NotifyingService, ActivitiesService) {
        var EntityPrefix = '/officeDocuments';

    // function getAll(start, limit, sort, sortOrder, status, folderId) {
    //     console.log(start, limit, sort, sortOrder, status, folderId)
    //      var query = "/?start=0&limit=25&sort=created";
    //     if (start && limit && sort) {
    //         query = "/?start=" + start + "&limit=" + limit + "&sort=" + sort;
    //     }
    //     if(status){
    //         query = "/?start=" + start + "&limit=" + limit + "&sort=" + sort + "&sortOrder=" + sortOrder + "&status="+ status;
    //     }
    //     if(folderId){
    //         query = "/?start=" + start + "&limit=" + limit + "&sort=" + sort + "&sortOrder=" + sortOrder + "&status="+ status + "&folderId="+ folderId;
    //     }
    //     return $http.get(ApiUri + EntityPrefix + query).then(function (result) {
    //         WarningsService.setWarning(result.headers().warning);
    //         // result.data = [{
    //         //             created: new Date,
    //         //             updated: new Date,
    //         //             _id: "hgjg",
    //         //             title: "sraya",
    //         //             path: "/gfdgdgf/dfgdfhg",
    //         //             description: "hello world",
    //         //             documentType: "pptx",
    //         //             entity: "project",
    //         //             entityId: "fff",
    //         //             creator: "avraham",
    //         //             status: "new"
    //         //                }]
    //         result.data.forEach(function (officeDocument) {
    //             officeDocument.created = new Date(officeDocument.created);
    //         });

    //             return result.data;
    //         });
    //     }
    function getAll(start, limit, sort, type, order) {
        var qs = querystring.encode({
            start: start,
            limit: limit,
            sort: sort,
            order:order,
            status:type
        });

        if (qs.length) {
            qs = '?' + qs;
        }
        console.log("get all " + ApiUri + EntityPrefix + qs);
        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            //console.log($rootScope.warning, '$rootScope.warning')
            return result.data;
        }, function(err) {return err}).then(function (some) {
            var data = some.content ? some : [];
            if(data.content) {
                data.content = data.content.map(doc => {
                    doc.created = new Date(doc.created);
                    return doc;
                });
            }
            return PaginationService.processResponse(data);
        });
    }

         function deleteDocument(id) {
             return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                 NotifyingService.notify('editionData');
                 return result.status;
             }).then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
         }

         function deleteDocumentFile(id){
             return $http.post(ApiUri+EntityPrefix+'/deleteDocumentFile/'+id).then(function(result){
                 return result.status;
             });
         }

        function addSerialTitle(document1){
            return $http.post(ApiUri + EntityPrefix + "/addSerialTitle", document1).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function signOnDocx(document1,signature){
            var json = {
                'officeDocuments':document1,
                'signature':signature
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

        function getByTaskId(id, start, limit, sort, starred) {
            let qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if(qs.length) {
                qs = '?' + qs;
            }

            let url = ApiUri + EntityPrefix + '/byTask/' + id + qs;
            if(starred) {
                url += '/starred';
            }

            return $http.get(url).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            })
            .then( docs => {
                return PaginationService.processResponse(docs);
            })
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
                result.data.forEach(function(officeDocument){
                    officeDocument.created = new Date(officeDocument.created);
                });
                return result.data;
            });
        }

        // function getByFolderId(id) {


        //     return $http.get(ApiUri + '/folders/' + id + EntityPrefix).then(function (result) {
        //         WarningsService.setWarning(result.headers().warning);

        //         result.data.forEach(function(officeDocument){
        //             officeDocument.created = new Date(officeDocument.created);
        //       }) ;

        //       return PaginationService.processResponse(result.data);
        //     });
        // }

        function getByFolderId(id, start, limit, sort, status) {

                var qs = querystring.encode({
                    start: 0,
                    limit: 25,
                    sort: "created",
                    status: status
                });

                if (qs.length) {
                    qs = '?' + qs;
                }

                var url = ApiUri  + '/folders/' + id + EntityPrefix;
                console.log("by folder " +url+ qs);
                return $http.get(url + qs).then(function(result) {
                    result.data.content.forEach(function(officeDocument) {
                        officeDocument.created = new Date(officeDocument.created);
                    });
                    WarningsService.setWarning(result.headers().warning);
                    return PaginationService.processResponse(result.data);
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





    function download(data,fileName){
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style','display:none');
        var blob = new Blob([new Uint8Array(data)]);
        var url = window.URL.createObjectURL(blob);
        a.href=url;
        a.download=fileName;
        a.click();
        setTimeout(function(){
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },0);


    }

    function getFileFtp(url) {
        return $http({method:'GET',url:ApiUri + "/ftp/" + url}).then(function(response){
            var json =response.data;
            var fileContent=json.fileContent.data;
            var fileName = json.fileName;
            download(fileContent,fileName);
            return response;
        },function(errorResponse){
              console.dir("ERROR RESPOSE");
            console.dir(errorResponse);
            return errorResponse;
        });
    }


    function updateDocument(id, data) {
        return $http.post(ApiUri + EntityPrefix + "/" + id, data).then(function (result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
        }).then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
    }

        function createDocument(data) {
            return $http.post(ApiUri + EntityPrefix + "/create" , data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                NotifyingService.notify('editionData');
                return result.data;
            });
        }

        function update(entity, data) {
            return $http.post(ApiUri + EntityPrefix + "/" +entity._id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            }).then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
        }

        function uploadFileToDocument(data,file){
            return Upload.upload({
                url: '/api/officeDocuments/uploadFileToDocument',
                fields: data,
                file: file
            })
        }

        function uploadDocumentFromTemplate(template,officeDocument){
            var json={
                'officeDocument':officeDocument,
                'templateDoc':template
            };
            return $http.post(ApiUri + EntityPrefix + "/uploadDocumentFromTemplate" , json).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            })
//.then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
        }

        function star(officeDocument) {
            return $http.patch(ApiUri + EntityPrefix + '/' + officeDocument._id + '/star', {star: !officeDocument.star})
                .then(function (result) {
                    WarningsService.setWarning(result.headers().warning);
                    officeDocument.star = !officeDocument.star;
                    return result.data;
                })
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
            }).then(result => {
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
            }).then(result => {
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
            }).then(result => {
              return result;
            });
        }

        function uploadEmpty(officeDocument){
            return $http.post(ApiUri+EntityPrefix+"/uploadEmpty",officeDocument).then(function(result){
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function updateDue(officeDocument, prev) {
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: 'updateDue',
                    TaskDue: officeDocument.due,
                    prev: prev.due
                },
                context: {}
            }).then(result => {
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

        function receiveDocument(officeDocument) {
            var data = {
                'officeDocument':officeDocument
            };
            return $http.post(ApiUri + EntityPrefix +  '/receiveDocument/' + officeDocument._id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            }).then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
        }

        function distributedDocument(officeDocument) {
            var data = {
                'officeDocument':officeDocument
            };
            return $http.post(ApiUri + EntityPrefix +  '/distributedDocument/' + officeDocument._id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            }).then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
        }

        function readByDocument(officeDocument) {
            var data = {
                'officeDocument':officeDocument
            };
            return $http.post(ApiUri + EntityPrefix +  '/readByDocument/' + officeDocument._id, data).then(function (result) {
                return result.data;
            });
        }

        function sentToDocument(officeDocument) {
            var data = {
                'officeDocument':officeDocument
            };
            return $http.post(ApiUri + EntityPrefix +  '/sentToDocument/' + officeDocument._id, data).then(function (result) {
                return result.data;
            }).then(entity => BoldedService.boldedUpdate(entity, 'officeDocuments', 'update'));
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
            }).then(result => {
              return result;
            });
        }

        function updateEntity(officeDocument, prev, type = 'folder') {
            let activityType = prev.folder ? 'updateEntity' : 'updateNewEntity';
            return ActivitiesService.create({
                data: {
                    issue: 'officeDocuments',
                    issueId: officeDocument._id,
                    type: activityType,
                    entityType: type,
                    entity: type === 'folder' ? officeDocument.folder.title : officeDocument.task.title,
                    prev: prev.folder ? prev.folder.title : ''
                },
                context: {}
            }).then(result => {
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
            }).then(result => {
              return result;
            });
        }

        function getFolderIndex(officeDocument){
            return $http.post(ApiUri + EntityPrefix + '/' + officeDocument._id + '/indexInFolder', officeDocument)
                .then(function (result) {
                    return result.data;
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
            getFolderIndex: getFolderIndex,
            getByUserId: getByUserId,
            saveDocument: saveDocument,
            updateDocument: updateDocument,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId,
            star: star,
            getStarred: getStarred,
            createDocument:createDocument,
            receiveDocument, receiveDocument,
            distributedDocument, distributedDocument,
            readByDocument, readByDocument,
            sentToDocument, sentToDocument,
            uploadFileToDocument:uploadFileToDocument,
            updateWatcher: updateWatcher,
            updateWatcherPerms: updateWatcherPerms,
            updateStatus: updateStatus,
            updateDue: updateDue,
            uploadDocumentFromTemplate:uploadDocumentFromTemplate,
            addSerialTitle:addSerialTitle,
            updateAssign: updateAssign,
            updateEntity: updateEntity,
            updateTitle: updateTitle,
            uploadEmpty:uploadEmpty,
            deleteDocumentFile:deleteDocumentFile,
            signOnDocx:signOnDocx,
            getFileFtp:getFileFtp
        };
    });
