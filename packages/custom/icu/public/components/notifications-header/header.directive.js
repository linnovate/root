'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function(NotificationsService, TasksService, UsersService, $state, context, ProjectsService) {
    function controller($scope) {
        $scope.notifications = NotificationsService.getAll();
        $scope.popupNotifications = $scope.notifications.slice(0, -1);
        $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];
        $scope.context = context;

        $scope.logout = function() {
            UsersService.logout().then(function() {
                $state.go('login');
            });
        }

        $scope.createTask = function() {
            var task = {
                title: 'New task',
                description: 'Task description',
                project: $scope.context.entityId,
                status: 'Received'
            }

            TasksService.create(task).then(function(result) {
                $state.go('main.tasks.byentity.details', {
                    id: result._id,
                    entity: $scope.context.entityName,
                    entityId: $scope.context.entityId
                }, { reload: true });
            });
        }

        $scope.createProject = function() {
            var project = {
                title: 'New project',
                color: 'blue'
            };

            ProjectsService.create(project).then(function(result) {
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
            createState: '@'
        },
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html',
    };
});
