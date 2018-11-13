'use strict';

angular.module('mean.icu.data.notificationsservice', [])
    .service('NotificationsService', function($http, ApiUri, WarningsService, $state) {

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

            let { title, body } = parseNotification(data);
            let notification = new Notification(title, {
                body,
                icon: '/favicon.ico'
            });

            notification.onclick = function(event) {
                this.close();
                window.focus();
                $state.go(`main.${data.entityType}s.all.details.${window.config.defaultTab}`, {
                    entity: 'all',
                    id: data.entity._id,
                    nameFocused: true
                });
            }
            audio.play();
            setTimeout(notification.close.bind(notification), 4000);
        }

        function parseNotification(data) {
            let { entity, creator, updateField, current } = data;
            let title = entity.title;
            let body = '';
            switch(updateField) {
                case 'assign':
                    body = 'You were assigned by ' + creator.name;
                    break;
                case 'due':
                    body = 'Due date changed to ' + moment(current).format('DD/MM/YYYY');
                    break;
                case 'status':
                    body = 'Status changed to ' + current.toUpperCase();
                    break;
                case 'comment':
                    body = creator.name + ' commented: ' + current;
                    break;
            }
            return { title, body };
        }

        return {
            notify
        };
    });
