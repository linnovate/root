'use strict';

angular.module('mean.icu.data.notificationsservice', [])
.service('NotificationsService', function($http, ApiUri) {
    var date = moment.duration(-5, 'minutes');
    
    var EntityPrefix = '/notification';

    var notifications = [];
    var notificationsToWatch = [];
    
    var lastNotification1 = [];

    function getAll() {
        return notifications;
    }

    function addNotification(entityName, assign, id) {
    	notifications.push({
	        entity: 'Task',
	        entityName: entityName,
	        action: 'assigned from',
	        user: assign,
	        date: date.humanize(true),
            id: id
	    });
	    if (notifications.length > 10) {
	    	notifications.shift();
	    }
        
        //
        if (lastNotification1.length != 0)
        {
            lastNotification1.pop();    
        }
        lastNotification1.push(notifications[notifications.length - 1]);

    }
    
    //Made By OHAD
    
    function getByUserId(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            
            return result.data;
        });
    }
    
    
    function addnotificationsToWatch() {
        
        // Need to pop everthing out because it is a poiter so we cant reinnlaize it
        while(notificationsToWatch.length > 0)
        {
            notificationsToWatch.pop();    
        }
        
        //Check if the notification watched before
        for (var notiy in notifications)
        {                    
            if (!notifications[notiy].IsWatched)
            {
                notificationsToWatch.push({num: notiy});
            }
        }       
    }
    
    function getAllnotificationsToWatch() {
        return notificationsToWatch;
    }

    //END Made By OHAD
    return {
        getAll: getAll,
        addNotification: addNotification,
        getByUserId: getByUserId,
        addnotificationsToWatch: addnotificationsToWatch,
        getAllnotificationsToWatch: getAllnotificationsToWatch
    };
});
