'use strict';

angular.module('mean.icu.data.activitiesservice', [])
.service('ActivitiesService', function ($http) {
    function getByUserId(id) {
        return [];
    }

    function getByProjectId(id) {
        return [];
    }

    function getByTaskId(id) {
        return [
            {
                description: 'My small description fo attached docs',
                user: {
                    name: 'Dan Doe'
                },
                attachments: [{
                    type: 'doc',
                    name: 'Meeting Summary'
                }, {
                    type: 'doc',
                    name: 'Meeting Summary 2'
                }]
            }, {
                description: 'John Smith say hello',
                user: {
                    name: 'John Doe'
                },
                attachments: [{
                    type: 'doc',
                    name: 'Meeting Summary'
                }]
            }, {
                description: 'John Fox document\'s',
                user: {
                    name: 'Anna Smith'
                },
                attachments: [{
                    type: 'doc',
                    name: 'Meeting Summary'
                }, {
                    type: 'doc',
                    name: 'Meeting Summary 2'
                }]
            }
        ];
    }

    return {
        getByUserId: getByUserId,
        getByTaskId: getByTaskId,
        getByProjectId: getByProjectId
    };
});
