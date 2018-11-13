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
        OfficeDocumentsService,
        $document) {
        function controller($scope) {

            UsersService.getMe().then(me => {

                // Handle the socket globally, in order to avoid duplicated connection in case
                // angular destroys and re-initializes the module
                if(window.socket) return;
                window.socket = io();

                window.socket.on('connect', () => {
                    console.log('socket.id:', window.socket.id);
                    window.socket.emit('register', me._id);
                })

                window.socket.on('update', NotificationsService.notify);

            })

            $scope.logout = function() {
                UsersService.logout().then(function() {
                    $state.go((config.activeProvider == 'local' ? 'login' : 'auth'), null, {
                        'reload': true
                    });
                });
            };

            $scope.openInbox = function() {
                $state.go('main.inbox', {
                    id: $scope.me._id
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
                    if (context.main === 'tasks' || context.main === 'officeDocuments') {
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
                    TasksService.data.push(result);
                    TasksService.IsNew = true;
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


                ProjectsService.create(project).then(function(result) {
                    $scope.projects.push(result);
                    params.id = result._id;
                    $state.go(state, params, {
                        reload: true
                    });
                });
            };

            $scope.createDiscussion = function() {
                let discussion = {
                    title: '',
                    watchers: [],
                };

                let params = {};
                let state = 'main.discussions.all.details.activities';
                let id = $stateParams.entityId || $stateParams.id;

                if ($stateParams.entity === 'project' && id) {
                    discussion['project'] = id;
                    state = 'main.discussions.byentity.details.activities';
                    params.entity = 'project';
                    params.entityId = id;
                }

                DiscussionsService.create(discussion).then(function(result) {
                    $scope.discussions.push(result);
                    params.id = result._id;
                    $state.go(state, params, {
                        reload: true
                    });
                });
            };

            $scope.createOfficeDocument = function() {
                let params = {},
                    state,
                    newDocument = {},
                    id = $stateParams.entityId || $stateParams.id;

                if ($stateParams.currentEntity === 'task' && id) {
                    newDocument.task = id;
                    state = 'main.tasks.officeDocument.details.activities';
                    params.entity = 'task';
                    params.entityId = id;
                } else {
                    state = 'main.officeDocuments.all.details.activities';
                }

                OfficeDocumentsService.createDocument(newDocument).then(function(result){
                    result.created=new Date(result.created);
                    $scope.officeDocuments.push(result);
                    params.id = result._id;

                    $state.go(state, params, {
                        reload: false
                    });

                });
        }
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
                tasks: '=',
                officeDocuments:'=',
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
            if (inputDate === now.setHours(0, 0, 0, 0)) {
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
