'use strict';

angular.module('mean.icu.data.templatedocsservice', [])
    .service('TemplateDocsService', function ($http, ApiUri, Upload, WarningsService) {
        var EntityPrefix = '/officeTemplates';

          function getAll() {
            return $http.get(ApiUri + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getTemplatesByFolder(folder){
            return $http.post(ApiUri + EntityPrefix+"/getByOfficeId",{'folder':folder}).then(function (result) {
                console.log("Data from getTEmplatesBYoffice");
                console.dir(result);
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

         function deleteTemplate(id) {
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
            delete:deleteTemplate,
            getById: getById,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveTemplateDoc: saveTemplateDoc,
            updateTemplateDoc: updateTemplateDoc,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId,
            getTemplatesByFolder:getTemplatesByFolder
        };
    });
