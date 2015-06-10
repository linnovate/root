'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function(NotificationsService, TasksService, UsersService, $state, context) {
    function controller($scope) {
        $scope.notifications = NotificationsService.getAll();
        $scope.lastNotification = _($scope.notifications).last();
        $scope.context = context;

        $scope.logout = function() {
            UsersService.logout().then(function() {
                $state.go('login');
            });
        }

        $scope.createTask = function() {
            var task = {
                title: 'New task',
                project: $scope.context.entityId
            }

            TasksService.create(task).then(function(result) {
                $state.go('main.tasks.byentity.details', {
                    id: result._id,
                    entity: $scope.context.entityName,
                    entityId: $scope.context.entityId
                }, { reload: true });
            });
        }
    }

    return {
        restrict: 'A',
        scope: {
            createState: '@',
        },
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html',
    };
});
