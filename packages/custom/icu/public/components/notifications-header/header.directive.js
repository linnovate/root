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
        $scope.allNotifications = false;

        $scope.triggerDropdown = function () {
            $scope.allNotifications = !$scope.allNotifications;
        };

        UsersService.getMe().then(function (me) {
            $scope.me = me;
        });

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
            var project = {
                color: 'b9e67d',
                title: '',
                watchers: [],
                status: 'New'
            };

            ProjectsService.create(project).then(function (result) {
                $scope.projects.push(result);
                $state.go('main.tasks.byentity.activities', {
                    id: result._id,
                    entity: 'project',
                    entityId: result._id
                });
            });
        };

        $scope.createDiscussion = function () {
            var discussion = {
                title: '',
                watchers: [],
                status: 'Set'
            };

            DiscussionsService.create(discussion).then(function (result) {
                $scope.discussions.push(result);
                $state.go('main.tasks.byentity.activities', {
                    id: result._id,
                    entity: 'discussion',
                    entityId: result._id
                });
            });
        };
    }

    return {
        restrict: 'A',
        scope: {
            createState: '@',
            discussions: '=',
            projects: '='
        },
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html'
    };
});
