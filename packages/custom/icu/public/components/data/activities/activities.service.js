'use strict';

angular.module('mean.icu.data.activitiesservice', [])
.service('ActivitiesService', function($http) {
    function getByUserId(id) {
        return [];
    }

    function getByProjectId(id) {
        return [];
    }

    function getByTaskId(id) {
        return [{
            title: 'John Doe added document to task',
            attachment: {
                type: 'doc',
                title: 'Meeting Summary',
            }
        }, {
            title: 'John Doe added document to task',
            attachment: {
                type: 'doc',
                title: 'Meeting Summary',
            }
        }, {
            title: 'John Doe added document to task',
            attachment: {
                type: 'doc',
                title: 'Meeting Summary',
            }
        }];
    }

    return {
        getByUserId: getByUserId,
        getByTaskId: getByTaskId,
        getByProjectId: getByProjectId
    };
});
