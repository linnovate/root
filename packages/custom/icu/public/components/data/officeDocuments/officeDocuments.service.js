'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
    .service('OfficeDocumentsService', function ($http, $stateParams, ApiUri, Upload,
                                                 PaginationService, BoldedService, WarningsService, NotifyingService, ActivitiesService) {
        var EntityPrefix = '/officeDocuments';
        var data = [];

    function getAll(start, limit, sort, type, order) {
        let qs = {
            start: start,
            sort: sort,
            order:order,
            status:type
        };
        let paramsId = $stateParams.id;
        qs.limit = findInExistingOfficeDocuments(paramsId) ? limit : paramsId;
        qs = querystring.encode(qs);

        if (qs.length) {
            qs = '?' + qs;
        }
        return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
            WarningsService.setWarning(result.headers().warning);
            data = result.data.content;
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

        function findInExistingOfficeDocuments(id){
            if(!id)return true;
            return !!data.find( taskInList => taskInList._id === id );
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

        function getByEntityId(entity) {
            return function(id, start, limit, sort, starred) {
                var qs = querystring.encode({
                    start: start,
                    limit: limit,
                    sort: sort
                });

                if(qs.length) {
                    qs = '?' + qs;
                }

                var url = ApiUri + '/' + entity + '/' + id + EntityPrefix;
                if(starred) {
                    url += '/starred';
                }

                return $http.get(url + qs).then(function(result) {
                    let data = result.data.content || result.data || [];
                    WarningsService.setWarning(result.headers().warning);
                    return PaginationService.processResponse(data);
                });
            };
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

        function uploadEmpty(officeDocument){
            return $http.post(ApiUri+EntityPrefix+"/uploadEmpty",officeDocument).then(function(result){
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function createActivity(updateField){
            return function(entity, me, prev){
                return ActivitiesService.create({
                    data: {
                        creator: me,
                        date: new Date(),
                        entity: entity._id,
                        entityType: 'officeDocument',

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
            getByTaskId: getByEntityId('tasks'),
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
            uploadDocumentFromTemplate:uploadDocumentFromTemplate,
            addSerialTitle:addSerialTitle,
            updateDue: createActivity('due'),
            updateStar: createActivity('star'),
            updateTags: createActivity('tags'),
            updateTitle: createActivity('title'),
            updateDescription: createActivity('description'),
            updateStatus: createActivity('status'),
            updateAssign: createActivity('assign'),
            updateWatcher: createActivity('watchers'),
            updateWatcherPerms: createActivity('permissions'),
            uploadEmpty:uploadEmpty,
            deleteDocumentFile:deleteDocumentFile,
            signOnDocx:signOnDocx,
            getFileFtp:getFileFtp
        };
    });
