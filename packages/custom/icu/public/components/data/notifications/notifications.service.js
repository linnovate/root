'use strict';

angular.module('mean.icu.data.notificationsservice', [])
.service('NotificationsService', function($http) {
    var date = moment.duration(-5, 'minutes');

    var notifications = [{
        entity: 'Task',
        entityName: 'Design homepage',
        action: 'assigned to',
        user: 'Idan Arbel',
        date: date.humanize(true)
    }, {
        entity: 'Task',
        entityName: 'Design task details',
        action: 'assigned to',
        user: 'Idan Arbel',
        date: date.humanize(true)
    }, {
        entity: 'Task',
        entityName: 'Design task list',
        action: 'assigned to',
        user: 'Idan Arbel',
        date: date.humanize(true)
    }];

    function getAll() {
        return notifications;
    }

    return {
        getAll: getAll,
    };
});
