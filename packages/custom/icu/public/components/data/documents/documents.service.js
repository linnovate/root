'use strict';

angular.module('mean.icu.data.documentsservice', [])
    .service('DocumentsService', function ($http, ApiUri, Upload, WarningsService) {
        var EntityPrefix = '/attachments';

        function getAll() {
            return $http.get(ApiUri + EntityPrefix).then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

         function delete1(id) {
             return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function (result) {
             	//WarningsService.setWarning(result.headers().warning);
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

        function saveAttachments(data, file) {

            // For SIze of the file - Angular sacks!
            //file = file[0];
            // file[1] = file[0];
            // file[2] = file[0];
            // file[3] = file[0];
            // file[4] = file[0];
            // file[5] = file[0];
            
            return Upload.upload({
                url: '/api/attachments',
                fields: data,
                file: file
            });
        }

        function updateAttachment(id, data) {
            return $http.post(ApiUri + EntityPrefix + id, data).then(function (result) {
            	WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function getByTasks() {
	        return $http.get(ApiUri + '/tasks/myTasks'  + EntityPrefix).then(function(result) {
	        	WarningsService.setWarning(result.headers().warning);
	            return result.data;
	        });
	    }

        return {
            delete:delete1,
            getAll: getAll,
            getById: getById,
            getByTaskId: getByTaskId,
            getByProjectId: getByProjectId,
            getByDiscussionId: getByDiscussionId,
            getByUserId: getByUserId,
            saveAttachments: saveAttachments,
            updateAttachment: updateAttachment,
            getByTasks: getByTasks,
            getByOfficeId: getByOfficeId,
            getByFolderId: getByFolderId
        };
    });
