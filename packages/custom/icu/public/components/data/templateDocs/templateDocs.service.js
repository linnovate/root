'use strict';

angular.module('mean.icu.data.officedocumentsservice', [])
    .service('TemplateDocsService', function ($http, ApiUri, Upload, WarningsService) {
        var EntityPrefix = '/templates';

          function getAll() {
            return $http.get(ApiUri + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

         function delete(id) {
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

        function saveTemplateDoc(data, file) {    
            return Upload.upload({
                url: '/api/templates',
                fields: data,
                file: file
            });
        }

        function updateTemplateDoc(id, data) {
            return $http.post(ApiUri + EntityPrefix + id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }
        return {
            delete:delete,
            getById: getById,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveTemplateDoc: saveTemplateDoc,
            updateTemplateDoc: updateTemplateDoc,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId
        };
    });
