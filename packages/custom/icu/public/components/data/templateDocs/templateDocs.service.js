'use strict';

angular.module('mean.icu.data.templatedocsservice', [])
    .service('TemplateDocsService', function ($http, BoldedService, ApiUri, NotifyingService, Upload, WarningsService, PaginationService, $rootScope) {
        var EntityPrefix = '/officeTemplates';
        var data, selected;

        //   function getAll() {
        //     return $http.get(ApiUri + EntityPrefix).then(function (result) {
        //         WarningsService.setWarning(result.headers().warning);
        //         return result.data;
        //     });
        // }

        function getAll(start, limit, sort) {
            var qs = querystring.encode({
                start: start,
                limit: limit,
                sort: sort
            });

            if (qs.length) {
                qs = '?' + qs;
            }
            return $http.get(ApiUri + EntityPrefix + qs).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            }, function(err) {return err}).then(function (some) {
                var data = some.content ? some : [];
                return PaginationService.processResponse(data);
            });
        }

        function getTemplatesByFolder(folder){
            return $http.post(ApiUri + EntityPrefix+"/getByOfficeId",{'folder':folder}).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

         function deleteTemplate(id) {
             return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
                 NotifyingService.notify('editionData');
                 return result.status;
             }).then(entity => BoldedService.boldedUpdate(entity, 'templateDocs', 'update'));
         }


         function getByTemplateDocId(id) {
            return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
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

        function saveTemplateDoc(data, file) {
            return Upload.upload({
                url: '/api/templates',
                fields: data,
                file: file
            });
        }

        function updateTemplateDoc(id, data) {
            return $http.post(ApiUri + EntityPrefix +'/'+ id, data).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                getById(id).then(entitiesArray=>BoldedService.boldedUpdate(entitiesArray[0], 'templateDocs', 'update'));
                return result.data;
            });
        }
        function create(templateDoc) {
            return $http.post(ApiUri + EntityPrefix+"/createNew", templateDoc).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                NotifyingService.notify('editionData');
                return result.data;
            });
        }

        function uploadTemplate(data,file){
            return Upload.upload({
                url: '/api/officeTemplates/uploadTemplate',
                fields: data,
                file: file
            });
        }
        return {
            delete:deleteTemplate,
            getById: getById,
            getByTemplateDocId:getByTemplateDocId,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveTemplateDoc: saveTemplateDoc,
            updateTemplateDoc: updateTemplateDoc,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId,
            getTemplatesByFolder:getTemplatesByFolder,
            getAll: getAll,
            data: data,
            selected : selected,
            create:create,
            uploadTemplate:uploadTemplate
        };
    });
