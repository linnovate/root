'use strict';

var generateStateByEntity= function(main) {


  var capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  var capitalizedMain = capitalize(main);

  var resolve = {};
  resolve[main + 's'] = [capitalizedMain + 'sService', '$stateParams', 'context', function(service, $stateParams, context) {
    return context.switchTo($stateParams.entity, $stateParams.entityId).then(function(newContext) {
      var entityName = newContext.entityName;
      var getFn = 'getBy' + capitalize(entityName) + 'Id';
      return service[getFn](newContext.entityId);
    });
  }];

  var state = {
    url: '/by-:entity/:entityId',
    views: {
      'middlepane@main': {
        templateUrl: '/icu/components/' + main + '-list/' + main + '-list.html',
        controller: capitalizedMain + 'ListController',
        resolve: resolve
      },
      'detailspane@main': {
        templateUrl: '/icu/components/' + main + '-details/no-' + main + 's.html'
      }
    }
  };

  return state;
}

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
        .state('profile', {
            url: '/profile',
            templateUrl: '/icu/components/profile-page/profile-page.html',
            controller: 'ProfileController',
            resolve: {
                me: function(UsersService) {
                    return UsersService.getMe();
                }
            }
        })
        .state('main', {
            abstract: true,
            url: '',
            templateUrl: '/icu/components/icu/icu.html',
            controller: 'IcuController',
            resolve: {
                me: function(UsersService) {
                    return UsersService.getMe();
                },
                projects: function(ProjectsService) {
                    return ProjectsService.getAll();
                }
            }
        })
        .state('main.people', {
            url: '/people',
            views: {
                middlepane: {
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function($state, projects, context) {
                        if (projects.length && $state.current.name === 'main.people') {
                            return context.switchTo('project', projects[0]._id).then(function(newContext) {
                                $state.go('main.people.byentity', {
                                    entity: newContext.entityName,
                                    entityId: newContext.entityId
                                });
                            });
                        }
                    }
                }
            }
        })
        .state('main.people.byentity', generateStateByEntity('user'))
        .state('main.people.byentity.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/user-details/user-details.html',
                    controller: 'UserDetailsController',
                    resolve: {
                        user: function(UsersService, $stateParams) {
                            return UsersService.getById($stateParams.id);
                        },
                        users: function(UsersService, $stateParams) {
                            return UsersService.getAll();
                        }
                    }
                }
            }
        })
        .state('main.people.byentity.details.projects', {
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
        .state('main.people.byentity.details.tasks', {
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
        .state('main.people.byentity.details.activities', {
            url: '/activities',
            views: {
                tab: {
                  stateateUrl: '/icu/components/user-details/tabs/activities/activities.html',
                    controller: 'UserActivitiesController',
                    resolve: {
                        activities: function(ActivitiesService, $stateParams) {
                            return ActivitiesService.getByUserId($stateParams.id);
                        }
                    }
                }
            }
        })
        .state('main.people.byentity.details.documents', {
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
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function($state, projects, context) {
                        if (projects.length && $state.current.name === 'main.tasks') {
                            return context.switchTo('project', projects[0]._id).then(function(newContext) {
                                $state.go('main.tasks.byentity', {
                                    entity: newContext.entityName,
                                    entityId: newContext.entityId
                                });
                            });
                        }
                    }
                }
            }
        })
        .state('main.tasks.byentity', generateStateByEntity('task'))
        .state('main.tasks.byentity.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/task-details/task-details.html',
                    controller: 'TaskDetailsController',
                    resolve: {
                        task: function(TasksService, $stateParams) {
                            return TasksService.getById($stateParams.id);
                        },
                        tags: function(TasksService) {
                            return TasksService.getTags();
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
        .state('main.tasks.byentity.details.activities', {
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
        .state('main.task.byentity.details.documents', {
            url: '/documents',
            views: {
                tab: {
                    templateUrl: '/icu/components/task-details/tabs/documents/documents.html',
                }
            }
        })
        .state('main.discussions', {
            url: '/discussions',
            views: {
                middlepane: {
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function($state, projects, context) {
                        if (projects.length && $state.current.name === 'main.discussions') {
                            return context.switchTo('project', projects[0]._id).then(function(newContext) {
                                $state.go('main.discussions.byentity', {
                                    entity: newContext.entityName,
                                    entityId: newContext.entityId
                                });
                            });
                        }
                    }
                }
            }
        })
        .state('main.discussions.byentity', generateStateByEntity('discussion'))
        .state('main.discussions.byentity.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/task-details/task-details.html',
                    controller: 'TaskDetailsController',
                    resolve: {
                        task: function(TasksService, $stateParams) {
                            return TasksService.getById($stateParams.id);
                        },
                        tags: function(TasksService) {
                            return TasksService.getTags();
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
        });
    }
]);

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
