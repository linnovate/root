'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function(NotificationsService) {
    function controller($scope) {
        $scope.notifications = NotificationsService.getAll();
        $scope.lastNotification = _($scope.notifications).last();
    }

    return {
        restrict: 'A',
        scope: {
            createState: '@'
        },
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html',
    };
});
