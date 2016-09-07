'use strict';

angular.module('mean.icu.data.notificationsservice', [])
.service('NotificationsService', function($http, ApiUri) {
    var date = moment.duration(-5, 'minutes');
    
    var EntityPrefix = '/notification';
    var EntityPrefix1 = '/notification1';

    var notifications = [];
    var notificationsToWatch = [];
    
    var lastNotification1 = [];
    
    var NumOfnotificationsToWatch = 0;

    function getAll() {
        return notifications;
    }

    function addNotification(entityName, assign, id, IsWatched, DropDownIsWatched) {
    	notifications.push({
	        //entity: 'Task',
            entity: 'task',
	        entityName: entityName,
	        action: 'assigned from',
	        user: assign,
	        date: date.humanize(true),
            id: id,
            IsWatched: IsWatched,
            DropDownIsWatched: DropDownIsWatched
	    });
	    if (notifications.length > 10) {
	    	notifications.shift();
	    }
        
        //     
        if (lastNotification1.length != 0)
        {
            lastNotification1.pop();    
        }
        
        if(notifications.length != 0)
        {
            lastNotification1.push({
                //entity: 'Task',
                entity: 'task',
                entityName: notifications[notifications.length - 1].entityName,
                action: 'assigned from',
                user: notifications[notifications.length - 1].assign,
                date: notifications[notifications.length - 1].date,
                id: notifications[notifications.length - 1].id
             });
        }
        //lastNotification1.push(notifications[notifications.length - 1]);

    }
    
    //Made By OHAD
    
    function Clean_notifications() {
        
        // Need to pop everthing out because it is a poiter so we cant reinnlaize it
        while(notifications.length > 0)
        {
            notifications.pop();    
        }
    }
    
    function addLastnotifications() {
        
        if (lastNotification1.length != 0)
        {
            lastNotification1.pop();    
        }
        
        if(notifications.length != 0)
        {
            lastNotification1.push({
                //entity: 'Task',
                entity: 'task',
                entityName: notifications[notifications.length - 1].entityName,
                action: 'assigned from',
                user: notifications[notifications.length - 1].assign,
                date: notifications[notifications.length - 1].date,
                id: notifications[notifications.length - 1].id
            });
            
            //lastNotification1.push(notifications[notifications.length - 1]);
        }
    }
    
    function getByUserId(id) {
        return $http.get(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            
            return result.data;
        });
    }
    
    function updateByUserId(id) {
        
        // console.log("=========================id============");
        // console.log(id);
        //return $http.put(ApiUri + EntityPrefix + '/' + id, id).then(function (result) {
            return $http.put(ApiUri + EntityPrefix + '/' + id).then(function (result) {
            
            return result.data;
        });
    }
    function updateByUserId_DropDown(id) {
        
            return $http.put(ApiUri + EntityPrefix1 + '/' + id).then(function (result) {
            
            return result.data;
        });
    }
    
    
    function Clean_notificationsToWatch() {
        
        // Need to pop everthing out because it is a poiter so we cant reinnlaize it
        while(notificationsToWatch.length > 0)
        {
            notificationsToWatch.pop();    
        }
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
            if (!notifications[notiy].DropDownIsWatched)
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
        getAllnotificationsToWatch: getAllnotificationsToWatch,
        addLastnotifications: addLastnotifications,
        updateByUserId: updateByUserId,
        Clean_notifications: Clean_notifications,
        Clean_notificationsToWatch: Clean_notificationsToWatch,
        updateByUserId_DropDown: updateByUserId_DropDown
    };
});
