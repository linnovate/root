'use strict';

angular.module('mean.icu.ui.notificationsheader', [])
.directive('icuNotificationsHeader', function (NotificationsService,
                                               TasksService,
                                               UsersService,
                                               $state,
                                               $stateParams,
                                               context,
                                               ProjectsService,
                                               DiscussionsService,
                                               $document) {
    function controller($scope) {

        $scope.notificationsToWatch = 0;
        NotificationsService.addnotificationsToWatch(); 
        $scope.notificationsToWatch = NotificationsService.getAllnotificationsToWatch();   
        
        // Get the saved Notifications of the user, and show it to him         
        UsersService.getMe().then(function (me) {
            NotificationsService.getByUserId(me._id).then(function (result) {
                
                for (var notiy in result) {
                    NotificationsService.addNotification(result[notiy].content, result[notiy].name, result[notiy].id);
                    
                    $scope.notifications = NotificationsService.getAll();
                    $scope.popupNotifications = $scope.notifications.slice(0, -1);
                    $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];
                    $scope.lastNotification1 = $scope.notifications[$scope.notifications.length - 1];
                }
                // For the notifications that didn't been Watched
                NotificationsService.addnotificationsToWatch(); 
                $scope.notificationsToWatch = NotificationsService.getAllnotificationsToWatch();
            });
        });
    	
    	var updateNotification = function(taskId) {
    		// TasksService.getById(taskId).then(function(data){
			// 	if (data.assign && $scope.me._id == data.assign._id) {
            //     	// NotificationsService.addNotification(data.title, data.assign);
            //     	// $scope.notifications = NotificationsService.getAll();
			// 		// $scope.popupNotifications = $scope.notifications.slice(0, -1);
			// 		// $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];
			// 	}
            // })
    	};

    	$scope.$on('updateNotification', function(event, args) {
    		updateNotification(args.taskId)
		});
        
        $scope.context = context;
        $scope.allNotifications = false;
        
        $scope.GoToNotification = function (this_notification) {
                $state.go('main.tasks.all.details', {
                    id: this_notification.id,
                    entity: context.entityName,
                    //entityId: context.entityId
                });
        }

        $scope.triggerDropdown = function () {
            $scope.allNotifications = !$scope.allNotifications;
            
            //Made By OHAD
            $scope.notifications = NotificationsService.getAll();
            $scope.popupNotifications = $scope.notifications.slice(0, -1);
            $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];

            // For the notifications that didn't been Watched                   
            NotificationsService.addnotificationsToWatch(); 
            $scope.notificationsToWatch = NotificationsService.getAllnotificationsToWatch();          
                    
            //END Made By OHAD
        };

        UsersService.getMe().then(function (me) {
            $scope.me = me;
            if (context.main === 'tasks') {
	            updateNotification($stateParams.id)
	        }
        });

        $scope.logout = function () {
            UsersService.logout().then(function () {
                $state.go('login', null, {'reload':true});
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

    function link($scope, $element) {
        var list = $element.find('.last-notification');
        var chevron = $element.find('.time');

        $document.on('click', function(e) {
            if(!(list[0].contains(e.target) || chevron[0].contains(e.target))) {
                $scope.allNotifications = false;
                $scope.$apply();
            }
        });
    }

    return {
        restrict: 'A',
        scope: {
            createState: '@',
            discussions: '=',
            projects: '='
        },
        link: link,
        controller: controller,
        templateUrl: '/icu/components/notifications-header/header.html'
    };
});
