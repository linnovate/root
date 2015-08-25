'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function (NotificationsService,
                                               TasksService,
                                               UsersService,
                                               $state,
                                               $stateParams,
                                               context,
                                               ProjectsService,
                                               DiscussionsService) {
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

        var entities = {
            projects: 'project',
            discussions: 'discussion',
            tasks: 'task'
        };

        $scope.createTask = function () {
            var task = {
                title: '',
                watchers: [],
                status: 'New',
                tags: []
            };

            var state = 'main.tasks.all.details'; // tasks.all
            var params = {
                entity: 'task'
            };

            if (context.entityName === 'all') {
                if (context.main === 'tasks') {
                    // tasks.all
                    state = 'main.tasks.all.details';
                    params.entity = 'task';
                } else {
                    // discussions.all, projects.all
                    state = 'main.tasks.byentity.details';
                    params.entityId = $stateParams.id;
                    params.entity = entities[context.main];
                    task[params.entity] = $stateParams.id;
                }
            } else {
                // tasks.projects, tasks.discussions, discussions.projects, projects.discussions
                state = 'main.tasks.byentity.details';
                params.entity = $stateParams.entity;
                params.entityId = $stateParams.entityId;
                task[$stateParams.entity] = $stateParams.entityId;
            }

            TasksService.create(task).then(function (result) {
                params.id = result._id;
                $state.go(state, params, {reload: true});
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
