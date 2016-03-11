'use strict';
angular.module('mean.icu').config([
    '$meanStateProvider',
    function ($meanStateProvider) {
        var LIMIT = 15;
        var SORT = 'created';

        var capitalize = function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        var generateStateByEntity = function (main) {
            var capitalizedMain = capitalize(main);

            var resolve = {};
            resolve[main + 's'] = [capitalizedMain + 'sService', '$stateParams',
            function (service, $stateParams) {
                var getFn = 'getBy' + capitalize($stateParams.entity) + 'Id';

                if (!service[getFn]) {
                    getFn = 'getById';
                }

                return service[getFn]($stateParams.entityId,
                        $stateParams.start,
                        $stateParams.limit,
                        $stateParams.sort,
                        $stateParams.starred);
            }];

            resolve.entity = ['context', function (context) {
                return context.entity;
            }];

            if (main !== 'task') {
                resolve.tasks = function (TasksService, $stateParams) {
                    if ($stateParams.entityId && $stateParams.id) {
                        return;
                    }
                    var getFn = 'getBy' + capitalize($stateParams.entity) + 'Id';

                    return TasksService[getFn]($stateParams.entityId);
                };
            }

            return {
                url: '/by-:entity/:entityId',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
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
                    templateUrl: '/icu/components/' + entity + '-list/' + entity + '-list.html',
                    controller: capitalize(entity) + 'ListController'
                }
            };


            if (resolve) {
                view['middlepane@main'].resolve = resolve;
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
                        controller: 'TaskDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function (tasks, $stateParams, TasksService) {
                        var task = _(tasks.data || tasks).find(function (t) {
                            return t._id === $stateParams.id;
                        });

                        if (!task) {
                            return TasksService.getById($stateParams.id).then(function(task) {
                                return task;
                            });
                        } else {
                            return task;
                        }
                    },
                    tags: function (TasksService) {
                        return TasksService.getTags();
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
                        controller: 'ProjectDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($stateParams, projects, ProjectsService) {
                        var project = _(projects.data || projects).find(function (t) {
                            return t._id === $stateParams.id;
                        });

                        if (!project) {
                            return ProjectsService.getById($stateParams.id).then(function(project) { return project; });
                        } else {
                            return project;
                        }
                    },
                    tasks: function (TasksService, $stateParams) {
                        return TasksService.getByProjectId($stateParams.id);
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
                        controller: 'DiscussionDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($stateParams, discussions, DiscussionsService) {
                        var discussion = _(discussions.data || discussions).find(function (t) {
                            return t._id === $stateParams.id;
                        });

                        if (!discussion) {
                            return DiscussionsService.getById($stateParams.id).then(function(discussion) { return discussion; });
                        } else {
                            return discussion;
                        }
                    },
                    tasks: function (TasksService, $stateParams) {
                        return TasksService.getByDiscussionId($stateParams.id);
                    }
                }
            };
        }

        function getAttachmentDetailsState(urlPrefix) {
            if (!urlPrefix) {
                urlPrefix = '';
            }

            return {
                url: urlPrefix + '/:id',
                views: {
                    'detailspane@main': {
                        templateUrl: '/icu/components/attachment-details/attachment-details.html',
                        controller: 'AttachmentDetailsController'
                    }
                },
                resolve: {
                    entity: function ($stateParams, results) {
                        return _(results).find(function (r) {
                            return r._id === $stateParams.id;
                        });
                    }
                }
            };
        }

        function getAttachmentDetailsTabState(main, tab) {
            return {
                url: '/versions',
                views: {
                    tab: {
                        templateUrl: '/icu/components/attachment-details/tabs/versions/versions.html',
                        controller: 'AttachmentVersionsController'
                    }
                },
                resolve: {
                    versions: function (entity) {
                        return entity.versions || [];
                    }
                }
            };
        }

        function getDetailsTabState(main, tab) {
            var capitalizedMain = capitalize(main);
            var capitalizedTab = capitalize(tab);

            var resolve = {};
            resolve[tab] = [capitalizedTab + 'Service', '$stateParams',
            function (service, $stateParams) {
                var entityName = $stateParams.id ? main : $stateParams.entity;
                var getFn = 'getBy' + capitalize(entityName) + 'Id';

                if (!service[getFn]) {
                    getFn = 'getById';
                }

                return service[getFn]($stateParams.id || $stateParams.entityId);
            }];

            resolve.entity = ['context', function (context) {
                return context.entity;
            }];

            return {
                url: '/' + tab,
                views: {
                    tab: {
                        templateUrl: function ($stateParams) {
                            var entity = $stateParams.id ? main : $stateParams.entity;
                            return '/icu/components/' + entity + '-details/tabs/' + tab + '/' + tab + '.html';
                        },
                        controllerProvider: function ($stateParams) {
                            var entity = $stateParams.id ? capitalizedMain : capitalize($stateParams.entity);
                            return entity + capitalizedTab + 'Controller';
                        }
                    }
                },
                resolve: resolve
            };
        }

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
                    return UsersService.getMe().then(function(result) {
                        return UsersService.getById(result._id);
                    });
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
                    return ProjectsService.getAll(0, LIMIT, SORT).then(function (data) {
                        return data;
                    }, function (err) {
                        return [];
                    });
                },
                discussions: function (DiscussionsService) {
                    return DiscussionsService.getAll(0, LIMIT, SORT).then(function (data) {
                        return data;
                    }, function (err) {
                        return [];
                    });
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
            params: {
                starred: false,
                start: 0,
                limit: LIMIT,
                sort: SORT
            },
            resolve: {
                tasks: function(TasksService, $stateParams) {
                    if ($stateParams.starred) {
                        return TasksService.getStarred();
                    } else {
                        return TasksService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                    }
                }
            }
        })
        .state('main.tasks.all.details', getTaskDetailsState())
        .state('main.tasks.all.details.activities', getDetailsTabState('task', 'activities'))
        .state('main.tasks.all.details.documents', getDetailsTabState('task', 'documents'))

        .state('main.tasks.byentity', generateStateByEntity('task'))
        .state('main.tasks.byentity.activities', getDetailsTabState('task', 'activities'))
        .state('main.tasks.byentity.documents', getDetailsTabState('task', 'documents'))
        .state('main.tasks.byentity.tasks', getDetailsTabState('task', 'tasks'))

        .state('main.tasks.byentity.details', getTaskDetailsState())
        .state('main.tasks.byentity.details.activities', getDetailsTabState('task', 'activities'))
        .state('main.tasks.byentity.details.documents', getDetailsTabState('task', 'documents'))

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
            }
        })
        .state('main.projects.all', {
            url: '/all',
            params: {
                starred: false,
                start: 0,
                limit: LIMIT,
                sort: SORT
            },
            views: getListView('project'),
            resolve: {
                projects: function(ProjectsService, $stateParams) {
                    if ($stateParams.starred) {
                        return ProjectsService.getStarred();
                    } else {
                        return ProjectsService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                    }
                }
            }
        })
        .state('main.projects.all.details', getProjectDetailsState())
        .state('main.projects.all.details.activities', getDetailsTabState('project', 'activities'))
        .state('main.projects.all.details.documents', getDetailsTabState('project', 'documents'))
        .state('main.projects.all.details.tasks', getDetailsTabState('project', 'tasks'))

        .state('main.projects.byentity', generateStateByEntity('project'))
        .state('main.projects.byentity.activities', getDetailsTabState('project', 'activities'))
        .state('main.projects.byentity.documents', getDetailsTabState('project', 'documents'))
        .state('main.projects.byentity.tasks', getDetailsTabState('project', 'tasks'))

        .state('main.projects.byentity.details', getProjectDetailsState())
        .state('main.projects.byentity.details.activities', getDetailsTabState('project', 'activities'))
        .state('main.projects.byentity.details.documents', getDetailsTabState('project', 'documents'))
        .state('main.projects.byentity.details.tasks', getDetailsTabState('project', 'tasks'))

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
            params: {
                starred: false,
                start: 0,
                limit: LIMIT,
                sort: SORT
            },
            views: getListView('discussion'),
            resolve: {
                discussions: function(DiscussionsService, $stateParams) {
                    if ($stateParams.starred) {
                        return DiscussionsService.getStarred();
                    } else {
                        return DiscussionsService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                    }
                }
            }
        })
        .state('main.discussions.all.details', getDiscussionDetailsState())
        .state('main.discussions.all.details.activities', getDetailsTabState('discussion', 'activities'))
        .state('main.discussions.all.details.documents', getDetailsTabState('discussion', 'documents'))
        .state('main.discussions.all.details.tasks', getDetailsTabState('discussion', 'tasks'))

        .state('main.discussions.byentity', generateStateByEntity('discussion'))
        .state('main.discussions.byentity.activities', getDetailsTabState('discussion', 'activities'))
        .state('main.discussions.byentity.documents', getDetailsTabState('discussion', 'documents'))
        .state('main.discussions.byentity.tasks', getDetailsTabState('discussion', 'tasks'))

        .state('main.discussions.byentity.details', getDiscussionDetailsState())
        .state('main.discussions.byentity.details.activities', getDetailsTabState('discussion', 'activities'))
        .state('main.discussions.byentity.details.documents', getDetailsTabState('discussion', 'documents'))
        .state('main.discussions.byentity.details.tasks', getDetailsTabState('discussion', 'tasks'))

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
                    if ($stateParams.query && $stateParams.query.length) {
                        return SearchService.find($stateParams.query);
                    } else {
                        return {};
                    }
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
        .state('main.search.task.activities', getDetailsTabState('task', 'activities'))
        .state('main.search.task.documents', getDetailsTabState('task', 'documents'))

        .state('main.search.project', getProjectDetailsState('/project'))
        .state('main.search.project.activities', getDetailsTabState('project', 'activities'))
        .state('main.search.project.documents', getDetailsTabState('project', 'documents'))
        .state('main.search.project.tasks', getDetailsTabState('project', 'tasks'))

        .state('main.search.discussion', getDiscussionDetailsState('/discussion'))
        .state('main.search.discussion.activities', getDetailsTabState('discussion', 'activities'))
        .state('main.search.discussion.documents', getDetailsTabState('discussion', 'documents'))
        .state('main.search.discussion.tasks', getDetailsTabState('discussion', 'tasks'))

        .state('main.search.attachment', getAttachmentDetailsState('/attachment'))
        .state('main.search.attachment.versions', getAttachmentDetailsTabState());
}
]);

angular.module('mean.icu').config(function ($i18nextProvider) {
    $i18nextProvider.options = {
        lng: 'en_US',
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'en_US',
        resGetPath: '/icu/assets/locales/__lng__/__ns__.json',
        defaultLoadingValue: ''
    };
});
