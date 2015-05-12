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
            attachments: [{
                type: 'doc',
                title: 'Meeting Summary',
            }, {
                type: 'doc',
                title: 'Meeting Summary 2',
            }, {
                type: 'doc',
                title: 'Meeting Summary 3',
            }, {
                type: 'doc',
                title: 'Meeting Summary 3',
            }, {
                type: 'doc',
                title: 'Meeting Summary 4',
            }, {
                type: 'doc',
                title: 'Meeting Summary 5',
            }]
        }, {
            title: 'John Doe added document to task',
            attachments: [{
                type: 'doc',
                title: 'Meeting Summary',
            }]
        }, {
            title: 'John Doe added document to task',
            attachments: [{
                type: 'doc',
                title: 'Meeting Summary',
            }, {
                type: 'doc',
                title: 'Meeting Summary 2',
            }]
        }];
    }

    return {
        getByUserId: getByUserId,
        getByTaskId: getByTaskId,
        getByProjectId: getByProjectId
    };
});
