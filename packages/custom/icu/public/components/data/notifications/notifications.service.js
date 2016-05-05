'use strict';

angular.module('mean.icu.data.notificationsservice', [])
.service('NotificationsService', function($http) {
    var date = moment.duration(-5, 'minutes');

    var notifications = [];

    function getAll() {
        return notifications;
    }

    function addNotification(entityName, assign) {
    	notifications.push({
	        entity: 'Task',
	        entityName: entityName,
	        action: 'assigned to',
	        user: assign.name,
	        date: date.humanize(true)
	    });
    }

    return {
        getAll: getAll,
        addNotification: addNotification
    };
});
