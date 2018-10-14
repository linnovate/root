'use strict';

angular.module('mean.icu.data.notificationsservice', [])
    .service('NotificationsService', function($http, ApiUri, WarningsService, $state) {

        var EntityPrefix = '/notification';
        var EntityPrefix1 = '/notification1';

        var data = {
            notifications: [],
            notificationsToWatch: 0,
            lastNotification: null,
            hasMore: 0,
            isFull:false
        };

        // audio file to play on push notification
        // audio source: https://notificationsounds.com/sound-effects/just-like-magic-506
        var audio = document.createElement('audio');
        audio.type = 'audio/ogg';
        audio.src = '/dist/icu/assets/audio/just-like-magic.mp3';

        if (Notification.permission !== "denied") {
            Notification.requestPermission(permission => {
            });
        }

        function notify(data) {
            console.log('New notification:', data);
            if(Notification.permission === 'denied') {
                console.log('Notification aborted - permission denied');
                return;
            }

            let { title, body, id } = parseNotification(data);
            let notification = new Notification(title, {
                body,
                icon: '/favicon.ico'
            });
            notification.onclick = function(event) {
                this.close();
                window.focus();
                $state.go('main.tasks.all.details', { id });
            }
            audio.play();
            setTimeout(notification.close.bind(notification), 4000);
        }

        function parseNotification(data) {
            let { entity, type, content, id } = data;
            let title = '';
            let body = '';
            switch(type) {
                case 'assign':
                    title += 'New';
                    body += 'You were assigned to';
            }
            title += ` ${entity}`;
            body += ` ${entity}: ${content}`;
            return { title, body, id };
        }

        return {
            notify
        };
    });
