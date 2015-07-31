'use strict';

angular.module('mean.icu.data.documentsservice', [])
    .service('DocumentsService', function ($http, ApiUri, Upload) {

        function getAttachments(id) {
            return $http.get(ApiUri + '/attachments/'/* + id*/).then(function (result) {
                return result.data;
            });
        }

        function saveAttachments(data, file) {
            Upload.upload({
                url: '/api/attachments',
                fields: data,
                file: file
            });
        }

        function updateAttachment(id, data) {
            return $http.post(ApiUri + '/attachments/' + id, data).then(function (result) {
                return result.data;
            });
        }

        return {
            getAttachments: getAttachments,
            saveAttachments: saveAttachments,
            updateAttachment: updateAttachment
        };
    });
