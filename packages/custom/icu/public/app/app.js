'use strict';

angular.module('mean.icu').config([
    '$meanStateProvider',
    function($meanStateProvider) {
        $meanStateProvider
        .state('login', {
            url: '/login',
            templateUrl: '/icu/components/login/login.html',
            controller: 'LoginController'
        })
        .state('register', {
            url: '/register',
            templateUrl: '/icu/components/register/register.html',
            controller: 'RegisterController'
        })
        .state('main', {
            abstract: true,
            url: '',
            templateUrl: '/icu/components/icu/icu.html',
            controller: 'IcuController',
            resolve: {
                me: function(UsersService) {
                    return UsersService.getMe();
                }
            }
        })
        .state('main.people', {
            url: '/people',
            views: {
                middlepane: {
                    templateUrl: '/icu/components/user-list/user-list.html',
                    controller: 'UserListController',
                    resolve: {
                        users: function(UsersService) {
                            return UsersService.getAll();
                        }
                    }
                },
                detailspane: {
                    templateUrl: '/icu/components/user-details/no-user-selected.html'
                }
            }
        })
        .state('main.people.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/user-details/user-details.html',
                    controller: 'UserDetailsController',
                    resolve: {
                        user: function(UsersService, $stateParams) {
                            return UsersService.getById(+$stateParams.id);
                        },
                        users: function(UsersService, $stateParams) {
                            return UsersService.getAll();
                        }
                    }
                }
            }
        })
        .state('main.people.details.projects', {
            url: '/projects',
            views: {
                tab: {
                    templateUrl: '/icu/components/user-details/tabs/projects/projects.html',
                    controller: 'UserProjectsController',
                    resolve: {
                        projects: function(ProjectsService) {
                            return ProjectsService.getAll();
                        }
                    }
                }
            }
        })
        .state('main.people.details.tasks', {
            url: '/tasks',
            views: {
                tab: {
                    templateUrl: '/icu/components/user-details/tabs/tasks/tasks.html',
                    controller: 'UserTasksController',
                    resolve: {
                        tasks: function(TasksService, $stateParams) {
                            //hack: temporary getAll
                            return TasksService.getAll($stateParams.id);
                        },
                        projects: function(ProjectsService, $stateParams) {
                            //hack: temporary getAll
                            return ProjectsService.getAll($stateParams.id);
                        }
                    }
                }
            }
        })
        .state('main.people.details.activities', {
            url: '/activities',
            views: {
                tab: {
                    templateUrl: '/icu/components/user-details/tabs/activities/activities.html',
                    controller: 'UserActivitiesController',
                    resolve: {
                        activities: function(ActivitiesService, $stateParams) {
                            return ActivitiesService.getByUserId($stateParams.id);
                        }
                    }
                }
            }
        })
        .state('main.people.details.documents', {
            url: '/documents',
            views: {
                tab: {
                    templateUrl: '/icu/components/user-details/tabs/documents/documents.html',
                }
            }
        })
        .state('main.tasks', {
            url: '/tasks',
            views: {
                middlepane: {
                    templateUrl: '/icu/components/task-list/task-list.html',
                    controller: 'TaskListController',
                    resolve: {
                        tasks: function(TasksService) {
                            return TasksService.getAll();
                        },
                        projects: function(ProjectsService) {
                            return ProjectsService.getAll();
                        }
                    }
                },
                detailspane: {
                    templateUrl: '/icu/components/task-details/no-tasks.html'
                }
            }
        })
        .state('main.tasks.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/task-details/task-details.html',
                    controller: 'TaskDetailsController',
                    resolve: {
                        task: function(TasksService, $stateParams) {
                            return TasksService.getById($stateParams.id);
                        },
                        project: function(task, ProjectsService) {
                            return ProjectsService.getById(task.project);
                        },
                        users: function(UsersService) {
                            return UsersService.getAll();
                        }
                    }
                }
            }
        })
        .state('main.tasks.details.activities', {
            url: '/activities',
            views: {
                tab: {
                    templateUrl: '/icu/components/task-details/tabs/activities/activities.html',
                    controller: 'TaskActivitiesController',
                    resolve: {
                        task: function(TasksService, $stateParams) {
                            return TasksService.getById($stateParams.id);
                        },
                        activities: function(ActivitiesService, $stateParams) {
                            return ActivitiesService.getByTaskId($stateParams.id);
                        }
                    }
                }
            }
        })
        .state('main.tasks.details.documents', {
            url: '/documents',
            views: {
                tab: {
                    templateUrl: '/icu/components/task-details/tabs/documents/documents.html',
                }
            }
        })
        .state('main.tasks.create', {
            url: '/create',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/task-create/task-create.html',
                    controller: 'TaskCreateController',
                    resolve: {
                        projects: function(ProjectsService) {
                            return ProjectsService.getAll();
                        }
                    }
                }
            }
        });
    }
]);

angular.module('mean.icu').controller('IcuController', function($rootScope, $scope, me, $state) {
    $scope.menu = {
        isHidden: false
    };

    if (!me) {
        $state.go('login');
    }

    $rootScope.$on('$stateChangeError', function() {
        console.log(arguments);
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        console.log(arguments);
    });
});

angular.module('mean.icu').config(function($i18nextProvider) {
    $i18nextProvider.options = {
        lng: 'he',
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'en-US',
        resGetPath: '/icu/assets/locales/__lng__/__ns__.json',
        defaultLoadingValue: ''
    };
});
