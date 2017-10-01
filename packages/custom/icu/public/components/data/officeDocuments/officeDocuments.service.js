'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
    .service('OfficeDocumentsService', function ($http, ApiUri, Upload, WarningsService) {
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
                return result.data;
            });
        }

         function deleteDocument(id) {
             return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                 return result.status;
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

         
        return {
            sendDocument:sendDocument,
            getAll: getAll,
            delete:deleteDocument,
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
            uploadFileToDocument:uploadFileToDocument
        };
    });
