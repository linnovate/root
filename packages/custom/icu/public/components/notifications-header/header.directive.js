'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function (NotificationsService,
                                               TasksService,
                                               UsersService,
                                               $state,
                                               context,
                                               ProjectsService,
                                               DiscussionsService,
                                               ngDialog) {
    function controller($scope) {
        $scope.notifications = NotificationsService.getAll();
        $scope.popupNotifications = $scope.notifications.slice(0, -1);
        $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];
        $scope.context = context;

        $scope.logout = function () {
            UsersService.logout().then(function () {
                $state.go('login');
            });
        };

        $scope.createTask = function () {
            ngDialog.open({
                template: '/icu/components/task-create/task-create.html',
                controller: 'TaskCreateController'
            });
        };

        $scope.createProject = function () {
            ngDialog.open({
                template: '/icu/components/project-create/project-create.html',
                controller: 'ProjectCreateController'
            });
        };

        $scope.createDiscussion = function() {
            ngDialog.open({
                template: '/icu/components/discussion-create/discussion-create.html',
                controller: 'DiscussionCreateController'
            });
        };
    }

    return {
        restrict: 'A',
        scope: {
            createState: '@'
        },
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html'
    };
});
