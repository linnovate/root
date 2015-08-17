'use strict';

var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

var generateStateByEntity = function (main) {
    var capitalizedMain = capitalize(main);

    var resolve = {};
    resolve[main + 's'] = [capitalizedMain + 'sService', '$stateParams', 'context',
        function (service, $stateParams) {
            var entityName = $stateParams.entity;
            var getFn = 'getBy' + capitalize(entityName) + 'Id';

            if (!service[getFn]) {
                getFn = 'getById';
            }

            return service[getFn]($stateParams.entityId);
        }];

    return {
        url: '/by-:entity/:entityId',
        views: {
            'middlepane@main': {
                templateUrl: '/icu/components/' + main + '-list/' + main + '-list.html',
                controller: capitalizedMain + 'ListController'
            },
            'detailspane@main': {
                templateUrl: function ($stateParams) {
                    return '/icu/components/' + $stateParams.entity + '-details/' +
                        $stateParams.entity + '-details.html';
                },
                controllerProvider: function ($stateParams) {
                    return capitalize($stateParams.entity) + 'DetailsController';
                }
            }
        },
        resolve: resolve
    };
};

var getListView = function (entity, resolve) {
    var view = {
        'middlepane@main': {
            templateUrl: '/icu/components/' + entity +  '-list/' + entity  + '-list.html',
            controller: capitalize(entity) + 'ListController'
        }
    };


    if (resolve) {
        view['middlepane@main'].resolve = resolve;
    }

    return view;
};

var getDetailsView = function (entity, resolve) {
    var view = {
        'detailspane@main': {
            templateUrl: '/icu/components/' + entity +  '-details/' + entity  + '-details.html',
            controller: capitalize(entity) + 'DetailsController'
        }
    };

    if (resolve) {
        view['detailspane@main'].resolve = resolve;
    }

    return view;
};

function getTaskDetailsState(urlPrefix) {
    if (!urlPrefix) {
        urlPrefix = '';
    }

    return {
        url: urlPrefix + '/:id',
        views: {
            'detailspane@main': {
                templateUrl: '/icu/components/task-details/task-details.html',
                controller: 'TaskDetailsController',
                resolve: {
                    task: function (tasks, $stateParams, TasksService) {
                        var task = _(tasks).find(function (t) {
                            return t._id === $stateParams.id;
                        });

                        if (!task) {
                            return TasksService.getById($stateParams.id);
                        } else {
                            return task;
                        }
                    },
                    tags: function (TasksService) {
                        return TasksService.getTags();
                    },
                    users: function (UsersService) {
                        return UsersService.getAll();
                    }
                }
            }
        }
    };
}

function getProjectDetailsState(urlPrefix) {
    if (!urlPrefix) {
        urlPrefix = '';
    }

    return {
        url: urlPrefix + '/:id',
        views: {
            'detailspane@main': {
                templateUrl: '/icu/components/project-details/project-details.html',
                controller: 'ProjectDetailsController',
                resolve: {
                    project: function ($stateParams, ProjectsService) {
                        return ProjectsService.getById($stateParams.id);
                    }
                }
            }
        }
    };
}

function getDiscussionDetailsState(urlPrefix) {
    if (!urlPrefix) {
        urlPrefix = '';
    }

    return {
        url: urlPrefix + '/:id',
        views: {
            'detailspane@main': {
                templateUrl: '/icu/components/discussion-details/discussion-details.html',
                //controller: 'ProjectDetailsController',
                resolve: {
                    discussion: function ($stateParams, DiscussionsService) {
                        return DiscussionsService.getById($stateParams.id);
                    }
                }
            }
        }
    };
}

function getDiscussionDetailsActivitiesState() {
    return {
        url: '/activities',
        views: {
            tab: {
                templateUrl: '/icu/components/discussion-details/tabs/activities/activities.html',
                controller: 'DiscussionActivitiesController',
                resolve: {
                    activities: function (ActivitiesService, $stateParams) {
                        return ActivitiesService.getByDiscussionId($stateParams.entityId);
                    }
                }
            }
        }
    };
}

function getDiscussionDetailsDocumentsState() {
    return {
        url: '/documents',
        views: {
            tab: {
                templateUrl: '/icu/components/discussion-details/tabs/documents/documents.html',
                controller: 'DiscussionDocumentsController',
                resolve: {
                    documents: function (DocumentsService, $stateParams) {
                        return DocumentsService.getAttachments($stateParams.entityId);
                    }
                }
            }
        }
    };
}

function getTaskDetailsActivitiesState() {
    return {
        url: '/activities',
        views: {
            tab: {
                templateUrl: '/icu/components/task-details/tabs/activities/activities.html',
                controller: 'TaskActivitiesController',
                resolve: {
                    task: function (TasksService, $stateParams) {
                        return TasksService.getById($stateParams.id);
                    },
                    activities: function (ActivitiesService, $stateParams) {
                        return ActivitiesService.getByTaskId($stateParams.id);
                    }
                }
            }
        }
    };
}

function getTaskDetailsDocumentsState() {
    return {
        url: '/documents',
        views: {
            tab: {
                templateUrl: '/icu/components/task-details/tabs/documents/documents.html',
                controller: 'TaskDocumentsController',
                resolve: {
                    task: function (TasksService, $stateParams) {
                        return TasksService.getById($stateParams.id);
                    },
                    documents: function (DocumentsService, $stateParams) {
                        return DocumentsService.getAttachments($stateParams.id);
                    }
                }
            }
        }
    };
}

angular.module('mean.icu').config([
    '$meanStateProvider',
    function ($meanStateProvider) {
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
                me: function (UsersService) {
                    return UsersService.getMe();
                },
                profile: function(UsersService) {
                    return UsersService.getProfile();
                }
            }
        })
        .state('main', {
            abstract: true,
            url: '',
            templateUrl: '/icu/components/icu/icu.html',
            controller: 'IcuController',
            resolve: {
                me: function (UsersService) {
                    return UsersService.getMe();
                },
                projects: function (ProjectsService) {
                    return ProjectsService.getAll();
                },
                discussions: function (DiscussionsService) {
                    return DiscussionsService.getAll();
                },
                people: function (UsersService) {
                    return UsersService.getAll();
                }
            }
        })
        .state('main.people', {
            url: '/people',
            views: {
                middlepane: {
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function ($state, $stateParams) {
                        if ($state.current.name === 'main.people') {
                            $state.go('main.people.byentity', {
                                entity: $stateParams.entity,
                                entityId: $stateParams.entityId
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
                        user: function (UsersService, $stateParams) {
                            return UsersService.getById($stateParams.id);
                        },
                        users: function (UsersService) {
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
                        userProjects: function (ProjectsService, $stateParams) {
                            return ProjectsService.getByUserId($stateParams.id);
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
                        tasks: function (TasksService, $stateParams) {
                            return TasksService.getByUserId($stateParams.id);
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
                        activities: function (ActivitiesService, $stateParams) {
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
                    templateUrl: '/icu/components/user-details/tabs/documents/documents.html'
                }
            }
        })
        .state('main.tasks', {
            url: '/tasks',
            views: {
                middlepane: {
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function ($state, context) {
                        $state.go('.byentity', {
                            entity: context.entityName,
                            entityId: context.entityId
                        });
                    }
                }
            }
        })
        .state('main.tasks.all', {
            url: '/all',
            views: getListView('task'),
            resolve: {
                tasks: function(TasksService) {
                    return TasksService.getAll();
                }
            }
        })
        .state('main.tasks.all.details', getTaskDetailsState())
        .state('main.tasks.all.details.activities', getTaskDetailsActivitiesState())
        .state('main.tasks.all.details.documents', getTaskDetailsDocumentsState())

        .state('main.tasks.byentity', generateStateByEntity('task'))
        .state('main.tasks.byentity.activities', getDiscussionDetailsActivitiesState())
        .state('main.tasks.byentity.documents', getDiscussionDetailsDocumentsState())
        .state('main.tasks.byentity.details', getTaskDetailsState())
        .state('main.tasks.byentity.details.activities', getTaskDetailsActivitiesState())
        .state('main.tasks.byentity.details.documents', getTaskDetailsDocumentsState())
        .state('main.projects', {
            url: '/projects',
            views: {
                middlepane: {
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function ($state, discussions, context) {
                        if ($state.current.name === 'main.projects') {
                            $state.go('.byentity', {
                                entity: context.entityName,
                                entityId: context.entityId
                            });
                        }
                    }
                }
            },
            resolve: {
                discussions: function (DiscussionsService) {
                    return DiscussionsService.getAll();
                }
            }
        })
        .state('main.projects.all', {
            url: '/all',
            views: getListView('project'),
            resolve: {
                projects: function(ProjectsService, context) {
                    return ProjectsService.getAll();
                }
            }
        })
        .state('main.projects.all.details', getProjectDetailsState())
        .state('main.projects.byentity', generateStateByEntity('project'))
        .state('main.projects.byentity.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: '/icu/components/project-details/project-details.html',
                    controller: 'ProjectDetailsController',
                    resolve: {
                        project: function ($stateParams, ProjectsService) {
                            return ProjectsService.getById($stateParams.id);
                        }
                    }
                }
            }
        })
        .state('main.discussions', {
            url: '/discussions',
            views: {
                middlepane: {
                    //hack around the fact that state current name is initialized in controller only
                    template: '',
                    controller: function ($state, projects, context) {
                        if ($state.current.name === 'main.discussions') {
                            $state.go('.byentity', {
                                entity: context.entityName,
                                entityId: context.entityId
                            });
                        }
                    }
                }
            }
        })
        .state('main.discussions.all', {
            url: '/all',
            views: getListView('discussion'),
            resolve: {
                projects: function(DiscussionsService) {
                    return DiscussionsService.getAll();
                }
            }
        })
        .state('main.discussions.all.details', getDiscussionDetailsState())
        .state('main.discussions.byentity', generateStateByEntity('discussion'))
        .state('main.discussions.byentity.details', getTaskDetailsState())
        .state('main.search', {
            url: '/search/:query',
            views: {
                'middlepane@main': {
                    templateUrl: '/icu/components/search-list/search-list.html',
                    controller: 'SearchListController'
                },
                'detailspane@main': {
                    templateUrl: '/icu/components/search-list/no-results.html'
                }
            },
            resolve: {
                results: function (SearchService, $stateParams) {
                    return SearchService.find($stateParams.query);
                },
                tasks: function (results) {
                    return _(results).filter(function (r) {
                        return r._type === 'task';
                    });
                },
                term: function ($stateParams) {
                    return $stateParams.query;
                }
            }
        })
        .state('main.search.task', getTaskDetailsState('/task'))
        .state('main.search.task.activities', getTaskDetailsActivitiesState())
        .state('main.search.task.documents', getTaskDetailsDocumentsState())
        .state('main.search.project', getProjectDetailsState('/project'))
        .state('main.search.discussion', getDiscussionDetailsState('/discussion'));
    }
]);

angular.module('mean.icu').config(function ($i18nextProvider) {
    $i18nextProvider.options = {
        lng: 'he',
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'en-US',
        resGetPath: '/icu/assets/locales/__lng__/__ns__.json',
        defaultLoadingValue: ''
    };
});
