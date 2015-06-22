'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function(NotificationsService, TasksService, UsersService, $state) {
    function controller($scope) {
        $scope.notifications = NotificationsService.getAll();
        $scope.lastNotification = _($scope.notifications).last();

        $scope.logout = function() {
            UsersService.logout().then(function() {
                $state.go('login');
            });
        }

        $scope.createTask = function() {
            var task = {
                title: 'New task'
            };

            TasksService.create(task).then(function(result) {
                $state.go('tasks.details.activities', { id: result._id });
            });
        }
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
