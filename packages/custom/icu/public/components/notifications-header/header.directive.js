'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
    .directive('icuNotificationsHeader', function(NotificationsService,
        TasksService,
        $state,
        $stateParams,
        context,
        ProjectsService,
        DiscussionsService,
        UsersService,
        $document) {
        function controller($scope) {

            $scope.notificationsToWatch = 0;

            // Get the saved Notifications of the user, and show it to him
            var getNotifications = function() {

                // Get the saved Notifications of the user, and show it to him
                NotificationsService.getByUserId($scope.me._id).then(function(response) {
                    $scope.data = NotificationsService.data;
                });
            };

            getNotifications();

            $scope.context = context;
            $scope.allNotifications = false;

            $scope.GoToNotification = function(this_notification) {
                if (!this_notification.IsWatched) {
                    NotificationsService.updateByUserId(this_notification._id).then(function(result) {
                        this_notification.IsWatched = true;
                    });
                }

                $scope.allNotifications = false;

                $state.go('main.tasks.all.details', {
                    id: this_notification.id,
                    entity: context.entityName,
                    //entityId: context.entityId
                });
            };

            $scope.triggerDropdown = function() {

                NotificationsService.updateByUserId_DropDown($scope.me._id).then(function(result) {

                    $scope.allNotifications = !$scope.allNotifications;

                    NotificationsService.data.notificationsToWatch = 0;

                });
            };

            $scope.loadMore = function() {
                NotificationsService.getByUserId($scope.me._id,false).then(function(response) {});
            };

            $scope.loadLess = function() {
                NotificationsService.getByUserId($scope.me._id,true).then(function(response) {});
            };

            $scope.details = {
                assign: [{
                    type: 'object',
                    value: 'entity'
                }, {
                    type: 'text',
                    value: '"',
                    klass: 'entity-name'
                }, {
                    type: 'object',
                    value: 'content',
                    klass: 'entity-name'
                }, {
                    type: 'text',
                    value: '"',
                    klass: 'entity-name'
                }, {
                    type: 'text',
                    value: 'assignedTo'
                }, {
                    type: 'deepObject',
                    value: ['user', 'name'],
                    klass: 'user'
                }]
            };

            $scope.logout = function() {
                UsersService.logout().then(function() {
                    $state.go((config.activeProvider == 'local' ? 'login' : 'auth'), null, {
                        'reload': true
                    });
                });
            };

            var entities = {
                projects: 'project',
                discussions: 'discussion',
                tasks: 'task'
            };

            $scope.createTask = function() {
                var task = {
                    title: '',
                    watchers: [],
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
                    if (context.entityName === 'task') {
                        state = 'main.tasks.byparent.details';
                        params.entity = $stateParams.entity;
                        params.entityId = $stateParams.entityId;
                        task.parent = $stateParams.entityId;
                    } else {
                        // tasks.projects, tasks.discussions, discussions.projects, projects.discussions
                        state = 'main.tasks.byentity.details';
                        params.entity = $stateParams.entity;
                        params.entityId = $stateParams.entityId;
                        task[$stateParams.entity] = $stateParams.entityId;
                    }
                }

                TasksService.create(task).then(function(result) {
                    params.id = result._id;
                    $state.go(state, params, {
                        reload: true
                    });
                });
            };

            $scope.createProject = function() {
                var project = {
                    color: '0097A7',
                    title: '',
                    watchers: [],
                };

                var params = {};
                var state = 'main.projects.all.details.activities';

                if ($stateParams.entity === 'discussion' && $stateParams.entityId) {
                    project['discussion'] = $stateParams.entityId;
                    state = 'main.projects.byentity.details.activities';
                    params.entity = 'discussion';
                    params.entityId = $stateParams.entityId;
                } else {
                    if (context.main === 'discussions' && $stateParams.id) {
                        project['discussion'] = $stateParams.id;
                        state = 'main.projects.byentity.details.activities';
                        params.entity = 'discussion';
                        params.entityId = $stateParams.id;
                    }
                }

                ProjectsService.create(project).then(function(result) {
                    $scope.projects.push(result);
                    params.id = result._id;
                    $state.go(state, params, {
                        reload: true
                    });
                });
            };

            $scope.createDiscussion = function() {
                var discussion = {
                    title: '',
                    watchers: [],
                };

                var params = {};
                var state = 'main.discussions.all.details.activities';

                if ($stateParams.entity === 'project' && $stateParams.entityId) {
                    discussion['project'] = $stateParams.entityId;
                    state = 'main.discussions.byentity.details.activities';
                    params.entity = 'project';
                    params.entityId = $stateParams.entityId;
                } else {
                    if (context.main === 'projects' && $stateParams.id) {
                        discussion['project'] = $stateParams.id;
                        state = 'main.discussions.byentity.details.activities';
                        params.entity = 'project';
                        params.entityId = $stateParams.id;
                    }
                }

                DiscussionsService.create(discussion).then(function(result) {
                    $scope.discussions.push(result);
                    params.id = result._id;
                    $state.go(state, params, {
                        reload: true
                    });
                });
            };
        }

        function link($scope, $element) {
            // var list = $element.find('.last-notification');
            // var chevron = $element.find('.time');

            // $document.on('click', function(e) {
            //     if (!(list[0].contains(e.target) || chevron[0].contains(e.target))) {
            //         $scope.allNotifications = false;
            //         $scope.$apply();
            //     }
            // });
        }

        return {
            restrict: 'A',
            scope: {
                createState: '@',
                discussions: '=',
                projects: '=',
                me: '='
            },
            link: link,
            controller: controller,
            templateUrl: '/icu/components/notifications-header/header.html'
        };
    }).filter('when', function($filter) {
        return function(input) {
            if (input === undefined) return '------';
            var now = new Date();
            var inputDate = new Date(input).setHours(0, 0, 0, 0);
            if (inputDate == now.setHours(0, 0, 0, 0)) {
                // return $filter('i18next')('today') + ', ' + $filter('date')(input, "hh:mm");
                return $filter('timeAgo')(input);
            }
            // if (inputDate == now.setDate(now.getDate() - 1)) {
            //     return $filter('i18next')('yesterday') + ', ' + $filter('date')(input, "hh:mm");
            // }
            var d = $filter('date')(input, 'd');
            var dd;
            switch (d) {
                case '1':
                    dd = 'st';
                    break;
                case '2':
                    dd = 'nd';
                    break;
                case '3':
                    dd = 'rd';
                    break;
                default:
                    dd = 'th';
                    break;
            }
            return $filter('i18next')($filter('date')(input, "MMMM")) + ' ' + d + $filter('i18next')(dd) + $filter('date')(input, ", yyyy") + $filter('date')(input, ", hh:mm");
        }
    }).config(function(timeAgoSettings) {
        var lng;
        switch (config.lng) {
            case 'he':
                lng = 'he_IL';
                break;
            default:
                lng = 'en_US';
        }
        timeAgoSettings.overrideLang = lng;
    });
