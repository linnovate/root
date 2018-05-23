'use strict';

angular.module('mean.icu.data.notificationsservice', [])
    .service('NotificationsService', function($http, ApiUri, WarningsService) {

        var EntityPrefix = '/notification';
        var EntityPrefix1 = '/notification1';

         var data = {
            notifications: [],
            notificationsToWatch: 0,
            lastNotification: null,
            hasMore: 0,
            isFull:false
        };

        function addLastnotification(notification) {
            data.notificationsToWatch += 1;
            data.notifications.unshift(notification);
            data.lastNotification = notification;
        }

        function getByUserId(id , wantLess) {
            var limit = data.notifications.length ? 5 : 4;
            return $http.get(ApiUri + EntityPrefix + '/' + id + '?limit=' + limit + '&skip=' + data.notifications.length).then(function(result) {
                data.notificationsToWatch = result.data.newMessages;
                data.notifications.push.apply(data.notifications, result.data.list);
                if(data.notifications.length >=10){
                	data.isFull=true;
                	data.notifications = data.notifications.slice(0,10);
                }
                if(wantLess){
                	data.isFull=false;
                	data.notifications = data.notifications.slice(0,5);
                }
                data.lastNotification = data.notifications[0];
                data.hasMore = result.data.count - data.notifications.length
                return;
            });
        }

        function updateByUserId(id) {

            return $http.put(ApiUri + EntityPrefix + '/' + id).then(function(result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        function updateByUserId_DropDown(id) {

            return $http.put(ApiUri + EntityPrefix1 + '/' + id).then(function(result) {
                WarningsService.setWarning(result.headers().warning);
                return result.data;
            });
        }

        return {
            getByUserId: getByUserId,
            addLastnotification: addLastnotification,
            updateByUserId: updateByUserId,
            updateByUserId_DropDown: updateByUserId_DropDown,
            data: data
        };
    });
