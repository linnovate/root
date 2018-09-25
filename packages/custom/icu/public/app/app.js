'use strict';

angular.module('mean.icu').config([
    '$meanStateProvider',
    function ($meanStateProvider) {
        var LIMIT = 25;
        var SORT = 'created';
        var BIGLIMIT = 2500;

        var capitalize = function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        var generateStateByEntity = function (main) {
            var capitalizedMain = capitalize(main);

            var resolve = {};
            resolve[main + 's'] = [capitalizedMain + 'sService', '$stateParams',
            function (service, $stateParams) {
                if($stateParams.officeDocuments){
                    return $stateParams.officeDocuments;
                }
                else{
                var getFn = 'getBy' + capitalize($stateParams.entity) + 'Id';
                if (!service[getFn]) {
                    getFn = 'getById';
                }
                if (service.IsNew) {
                    return service[getFn]($stateParams.entityId,
                        $stateParams.start,
                        BIGLIMIT,
                        $stateParams.sort,
                        $stateParams.starred);
                }
                else {
                    return service[getFn]($stateParams.entityId,
                        $stateParams.start,
                        $stateParams.limit,
                        $stateParams.sort,
                        $stateParams.status,
                        $stateParams.starred);
                }
            }
            }
            ];

            resolve.entity = ['context',
                function (context) {
                    return context.entity;
                }
            ];
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
                    sort: SORT,
                    status:undefined,
                },
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/entity-list/entity-list.html',
                        controller: capitalizedMain + 'ListController'
                    },
                    'detailspane@main': {
                        templateUrl: function ($stateParams) {
                            if (!$stateParams.entity) return '';
                            else return '/icu/components/' + $stateParams.entity + '-details/' +
                                $stateParams.entity + '-details.html';
                        },
                        controllerProvider: function ($stateParams) {
                            if (!$stateParams.entity) return '';
                            else return capitalize($stateParams.entity) + 'DetailsController';
                        }
                    }
                },
                resolve: resolve
            }
        };

        var getListView = function (entity, resolve) {
            var view = {
                'middlepane@main': {
                    templateUrl: '/icu/components/entity-list/entity-list.html',
                    controller: capitalize(entity) + 'ListController'
                },
                'detailspane@main': {
                    templateUrl: '/icu/components/all/all.html',
                    controller: 'AllController'
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
                    },
//                     'subtasks@main': {
//                         templateUrl: '/icu/components/sub-tasks/sub-tasks.html',
//                         controller: 'SubTasksController'
//                     }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($state, $stateParams, tasks, TasksService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(t => t._id === $stateParams.id);
                        } else {
                            let task = _(tasks.data || tasks).find(t => t._id === $stateParams.id);
                            return task ?
                                task :
                                TasksService.getById($stateParams.id)
                        }
                    },
                    tags: function (TasksService) {
                        return TasksService.getTags().then(function (tags) {
                            return tags;
                        });
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
                    },
//                     'subProjects@main': {
//                         templateUrl: '/icu/components/sub-projects/sub-projects.html',
//                         controller: 'SubProjectsController'
//                     }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($state, $stateParams, projects, ProjectsService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(d => d._id === $stateParams.id);
                        } else {
                            let project = _(projects.data || projects).find(t => t._id === $stateParams.id);
                            return project ?
                                project :
                                ProjectsService.getById($stateParams.id)
                        }
                    },
                    tasks: function (TasksService, $stateParams) {
                        return TasksService.getByProjectId($stateParams.id);
                    },
                    people: function (UsersService) {
                        return UsersService.getAll();
                    },
                    tags: function (ProjectsService) {
                        return ProjectsService.getTags().then(function (tags) {
                            return tags;
                        });
                    }
                }
            }
        }

        function getOfficeDocumentDetailsState(urlPrefix) {
            if (!urlPrefix) {
                urlPrefix = '';
            }

            return {
                url: urlPrefix + '/:id',
                views: {
                    'detailspane@main': {
                        templateUrl: '/icu/components/officeDocument-details/officeDocument-details.html',
                        controller: 'OfficeDocumentDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($state, $stateParams, officeDocuments, OfficeDocumentsService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(d => d._id === $stateParams.id);
                        } else {
                            let officeDocument = _(officeDocuments.data || officeDocuments).find(t => t._id === $stateParams.id);
                            return officeDocument ?
                                officeDocument :
                                OfficeDocumentsService.getById($stateParams.id)
                        }
                    },
                    people: function (UsersService) {
                        return UsersService.getAll();
                    }
                }
            };
        }

        function getOfficeDetailsState(urlPrefix) {
            if (!urlPrefix) {
                urlPrefix = '';
            }

            return {
                url: urlPrefix + '/:id',
                views: {
                    'detailspane@main': {
                        templateUrl: '/icu/components/office-details/office-details.html',
                        controller: 'OfficeDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($state, $stateParams, offices, OfficesService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(d => d._id === $stateParams.id);
                        } else {
                            let office = _(offices.data || offices).find(t => t._id === $stateParams.id);
                            return office ?
                                office :
                                OfficesService.getById($stateParams.id)
                        }
                    },
                    folders: function (FoldersService, $stateParams) {
                        return FoldersService.getByOfficeId($stateParams.id);
                    },
                    people: function (UsersService) {
                        return UsersService.getAll();
                    }
                }
            };
        }

        function getTemplateDocDetailsState(urlPrefix) {
            if (!urlPrefix) {
                urlPrefix = '';
            }

            return {
                url: urlPrefix + '/:id',
                views: {
                    'detailspane@main': {
                        templateUrl: '/icu/components/templateDoc-details/templateDoc-details.html',
                        controller: 'TemplateDocDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($state, $stateParams, templateDocs, TemplateDocsService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(d => d._id === $stateParams.id);
                        } else {
                            let templateDoc = _(templateDocs.data || templateDocs).find(t => t._id === $stateParams.id);
                            return templateDoc ?
                                templateDoc :
                                TemplateDocsService.getById($stateParams.id)
                        }
                    },
                    people: function (UsersService) {
                        return UsersService.getAll();
                    }
                }
            };
        }

        function getFolderDetailsState(urlPrefix) {
            if (!urlPrefix) {
                urlPrefix = '';
            }

            return {
                url: urlPrefix + '/:id',
                views: {
                    'detailspane@main': {
                        templateUrl: '/icu/components/folder-details/folder-details.html',
                        controller: 'FolderDetailsController'
                    }
                },
                params: {
                    nameFocused: false
                },
                resolve: {
                    entity: function ($state, $stateParams, folders, FoldersService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(d => d._id === $stateParams.id);
                        } else {
                            let folder = _(folders.data || folders).find(t => t._id === $stateParams.id);
                            return folder ?
                                folder :
                                FoldersService.getById($stateParams.id)
                        }
                    },
                    tasks: function (TasksService, $stateParams) {
                        return TasksService.getByFolderId($stateParams.id);
                    },
                    officeDocuments: function (OfficeDocumentsService, $stateParams) {
                        return OfficeDocumentsService.getByFolderId($stateParams.id);
                    },
                    people: function (UsersService) {
                        return UsersService.getAll();
                    },
                    tags: function (FoldersService) {
                        return FoldersService.getTags().then(function (tags) {
                            return tags;
                        });
                    }
                }
            };
        }

        function getDetailspaneModal() {
            return {
                url: '/modal',
                onEnter: ['$stateParams', '$state', '$uibModal', '$resource', 'LayoutService', function ($stateParams, $state, $uibModal, $resource, LayoutService) {
                    $uibModal.open({
                        templateUrl: "/icu/components/detailspane/detailspane-modal.html",
                        size: 'lg',
                        controller: ['$scope', function ($scope) {
                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        }]
                    }).result.finally(function () {
                        LayoutService.unClick();
                        $state.go('^');
                    });
                }]
            }
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
                    entity: function ($state, $stateParams, discussions, DiscussionsService, results = []) {
                        if($state.current.name.indexOf('search') !== -1){
                            return _(results.data || results).find(d => d._id === $stateParams.id);
                        } else {
                            let discussion = _(discussions.data || discussions).find(t => t._id === $stateParams.id);
                            return discussion ?
                                discussion :
                                DiscussionsService.getById($stateParams.id)
                        }
                    },
                    tasks: function (TasksService, $stateParams) {
                        return TasksService.getByDiscussionId($stateParams.id);
                    },
                    tags: function (DiscussionsService) {
                        return DiscussionsService.getTags().then(function (tags) {
                            return tags;
                        });
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
                            return r.entityId === $stateParams.id;
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
            //task , activities
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
            }
            ];

            resolve.entity = ['context',
                function (context) {
                    return context.entity;
                }
            ];

            return {
                url: '/' + tab,
                views: {
                    tab: {
//                         templateUrl: function ($stateParams) {
//                             var entity = $stateParams.id ? main : $stateParams.entity;
//                             return '/icu/components/' + entity + '-details/tabs/' + tab + '/' + tab + '.html';
//                         },
                        controllerProvider: function ($stateParams) {
                            var entity = $stateParams.id ? capitalizedMain : capitalize($stateParams.entity);
                            return entity + capitalizedTab + 'Controller';
                        }
                    }
                },
                resolve: resolve
            };
        }

        function getDetailsSubTasksState() {
            return {
                url: '/subtasks',
                views: {
//                     subtasks: {
//                         templateUrl: '/icu/components/sub-tasks/sub-tasks.html',
//                         controller: 'SubTasksController'
//                     }
                },
                resolve: {
                    subtasks: function (TasksService) {
                        return TasksService.getSubTasks();
                    }
                }
            };
        }

        function getDetailsByAssignTabState(tab) {
            var capitalizedTab = capitalize(tab);

            var resolve = {};
            resolve[tab] = [capitalizedTab + 'Service',
            function (service) {
                return service['getByTasks']();
            }
            ];

            resolve.entity = ['context',
                function (context) {
                    return context.entity;
                }
            ];

            return {
                url: '/' + tab,
                views: {
                    tab: {
//                         templateUrl: function ($stateParams) {
//                             return '/icu/components/task-details/tabs/' + tab + '/' + tab + '.html';
//                         },
                        controllerProvider: function ($stateParams) {
                            return 'Task' + capitalizedTab + 'Controller';
                        }
                    }
                },
                resolve: resolve
            };
        }

        function getRecycledEntities(main) {
            return {
                url: 'search/recycled',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/search-list/search-list.html',
                        controller: 'SearchListController'
                    },                    'detailspane@main': {
                        templateUrl: '/icu/components/task-options/task-options.html',
                        controller: 'TaskOptionsController'
                    }
                },
                resolve: {
                    results: function (EntityService,SearchService, $stateParams) {
                        let unmerged = EntityService.getRecycleBin("all") ;
                        return unmerged.then(function(arrays) {
                            let merged = [].concat.apply([], arrays);
                            let mergedAdjuested = merged.map(function(item) {
                                item._type = "task"; // not entity type. type kept in "type".
                                item.id = item._id;
                                return item ;
                            })
                            return mergedAdjuested ;
                        })
                    }
                    },
                    tasks: function (results) {
                        return _(results).filter(function (r) {
                            return r._type === 'task';
                        });
                    }
            }
        }



        $meanStateProvider
            .state('404', {
                url: '/404',
                templateUrl: '/icu/components/errors/404.html',
                controller: 'ErrorsController'
            })
            .state('401', {
                url: '/401',
                templateUrl: '/icu/components/errors/401.html',
                controller: 'ErrorsController'
            })
            .state('auth', {
                url: '/auth',
                templateUrl: '/icu/components/auth/auth.html',
                resolve: {
                    checkProvider: ['$state', '$timeout',
                        function ($state, $timeout) {
                            if (config.activeProvider === 'local') {
                                return $timeout(function () {
                                    $state.go('login')
                                })
                            }
                        }
                    ]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: '/icu/components/login/login.html',
                controller: 'LoginController',
                resolve: {
                    checkProvider: ['$state', '$timeout',
                        function ($state, $timeout) {
                            if (config.activeProvider !== 'local') {
                                return $timeout(function () {
                                    $state.go('auth')
                                })
                            }
                        }
                    ]
                }
            })
            .state('saml', {
                url: '/saml',
                controller: 'LoginSamlController'
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
                        return UsersService.getMe().then(function (result) {
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
                        return ProjectsService.getAll(0, 0, SORT).then(function (data) {
                            ProjectsService.data = data.data || data;
                            return data;
                        }, function (err) {
                            return [];
                        });
                    },
                    discussions: function (DiscussionsService) {
                        return DiscussionsService.getAll(0, 0, SORT).then(function (data) {
                            DiscussionsService.data = data.data || data;
                            return data;
                        }, function (err) {
                            return [];
                        });
                    },
                    tasks: function (TasksService) {
                        return TasksService.getAll(0, 0, SORT).then(function (data) {
                            TasksService.data = data.data || data;
                            return data;
                        }, function (err) {
                            return [];
                        });
                    },
                    offices: function (OfficesService) {
                        return OfficesService.getAll(0, 0, SORT).then(function (data) {
                            OfficesService.data = data.data || data;
                            return data;
                        }, function (err) {
                            return [];
                        });
                    },
                    templateDocs: function (TemplateDocsService) {
                        //return TemplateDocsService.getAll().then(function (data) {
                        return TemplateDocsService.getAll(0, 0, SORT).then(function (data) {
                            TemplateDocsService.data = data.data || data;
                            return data;
                        }, function (err) {
                            return [];
                        });
                    },
                    folders: function (FoldersService) {
                        return FoldersService.getAll(0, 0, SORT).then(function (data) {
                            FoldersService.data = data.data || data;
                            return data;
                        }, function (err) {
                            return [];
                        });
                    },
                    officeDocuments: function (OfficeDocumentsService) {
                        return OfficeDocumentsService.getAll(0, 0, SORT).then(function (data) {
                            OfficeDocumentsService.data = data.data || data;
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
                        controller: function ($state, context) {
                            if ($state.current.name === 'main.people') {
                                $state.go('.byentity', {
                                    entity: context.entityName,
                                    entityId: context.entityId
                                });
                            }
                        }
                    }
                }
            })
            .state('main.people.all', {
                url: '/all',
                views: getListView('user'),
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                resolve: {
                    users: function (UsersService, $stateParams) {
                        // if ($stateParams.starred) {
                        //     return UsersService.getStarred();
                        // } else {
                        return UsersService.getAll($stateParams.start,
                            $stateParams.limit,
                            $stateParams.sort);
                        // }
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
//                         templateUrl: '/icu/components/user-details/tabs/projects/projects.html',
                        controller: 'UserProjectsController',
                        resolve: {
                            userProjects: function (ProjectsService, $stateParams) {
                                return ProjectsService.getByUserId($stateParams.id);
                            }
                        }
                    }
                }
            })
            // .state('main.people.byentity.details.officeDocuments', {
            //     url: '/officeDocuments',
            //     views: {
            //         tab: {
            //             templateUrl: '/icu/components/user-details/tabs/officeDocuments/officeDocuments.html',
            //             controller: 'UserOfficeDocumentsController',
            //             resolve: {
            //                 userOfficeDocuments: function(OfficeDocumentsService, $stateParams) {
            //                     return OfficeDocumentsService.getByUserId($stateParams.id);
            //                 }
            //             }
            //         }
            //     }
            // })
            .state('main.people.byentity.details.offices', {
                url: '/offices',
                views: {
                    tab: {
//                         templateUrl: '/icu/components/user-details/tabs/offices/offices.html',
                        controller: 'UserOfficesController',
                        resolve: {
                            userOffices: function (OfficesService, $stateParams) {
                                return OfficesService.getByUserId($stateParams.id);
                            }
                        }
                    }
                }
            })
            .state('main.people.byentity.details.folders', {
                url: '/folders',
                views: {
                    tab: {
                        templateUrl: '/icu/components/user-details/tabs/folders/folders.html',
                        controller: 'UserFoldersController',
                        resolve: {
                            userFolders: function (FoldersService, $stateParams) {
                                return FoldersService.getByUserId($stateParams.id);
                            }
                        }
                    }
                }
            })
            .state('main.people.byentity.details.tasks', {
                url: '/tasks',
                views: {                    // tasks: function(TasksService, $stateParams) {
                    //     return TasksService.getByOfficeDocumentId($stateParams.id);
                    // },
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
            // .state('socket', {
            //     // url: '/help',
            //     // template: '/home/as/Desktop/icu/packages/custom/mean-socket/public/views/index.html',
            //     // url: '/help1',
            //     // template: '/home/as/Desktop/icu/packages/custom/mean-socket/public/views/index1.html',
            //     url: '/help2',
            //     template: '/home/as/Desktop/icu/packages/custom/mean-socket/public/views/index2.html',
            //     controller: 'MeanSocketController'
            // })
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
                    activeToggle: 'active',
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                resolve: {
                    tasks: function (TasksService, $stateParams) {
                        if ($stateParams.starred) {
                            return TasksService.getStarred();
                        } else {
                           // if (typeof TasksService.data !== 'undefined') {
                            //    $stateParams.limit = TasksService.data.length;
                           // }
                            return TasksService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.tasks.all.details', getTaskDetailsState())
            .state('main.tasks.all.details.activities', getDetailsTabState('task', 'activities'))
            .state('main.tasks.all.details.activities.modal', getDetailspaneModal())
            .state('main.tasks.all.details.documents', getDetailsTabState('task', 'documents'))
            // .state('main.tasks.all.details.subtasks', getDetailsSubTasksState())

            .state('main.tasks.byentity', generateStateByEntity('task'))
            .state('main.tasks.byentity.activities', getDetailsTabState('task', 'activities'))
            .state('main.tasks.byentity.activities.modal', getDetailspaneModal())
            .state('main.tasks.byentity.documents', getDetailsTabState('task', 'documents'))
            .state('main.tasks.byentity.tasks', getDetailsTabState('task', 'tasks'))
            // .state('main.tasks.byentity.subtasks', getDetailsSubTasksState())

            .state('main.tasks.byentity.details', getTaskDetailsState())
            .state('main.tasks.byentity.details.activities', getDetailsTabState('task', 'activities'))
            .state('main.tasks.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.tasks.byentity.details.documents', getDetailsTabState('task', 'documents'))
            // .state('main.tasks.byentity.details.subtasks', getDetailsSubTasksState())

            .state('main.tasks.byassign', {
                url: '/my',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/entity-list/entity-list.html',
                        controller: 'TaskListController'
                    },
                    'detailspane@main': {
                        templateUrl: '/icu/components/task-options/task-options.html',
                        controller: 'TaskOptionsController'
                    }
                },
                resolve: {
                    tasks: function (TasksService, $stateParams) {
                        if ($stateParams.starred) {
                            return TasksService.getStarredByassign();
                        } else {
                          //  if (typeof TasksService.data !== 'undefined') {
                          //      $stateParams.limit = TasksService.data.length;
                          //  }
                            return TasksService.getMyTasks($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.tasks.byassign.activities', getDetailsByAssignTabState('activities'))
            .state('main.tasks.byassign.activities.modal', getDetailspaneModal())
            .state('main.tasks.byassign.documents', getDetailsByAssignTabState('documents'))
            .state('main.tasks.byassign.details', getTaskDetailsState())
            .state('main.tasks.byassign.details.activities', getDetailsTabState('task', 'activities'))
            .state('main.tasks.byassign.details.activities.modal', getDetailspaneModal())
            .state('main.tasks.byassign.details.documents', getDetailsTabState('task', 'documents'))


            .state('main.tasks.byparent', {
                url: '/subTasks/:entityId',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/entity-list/entity-list.html',
                        controller: 'TaskListController'
                    },
                    'detailspane@main': {
                        templateUrl: '/icu/components/task-details/task-details.html',
                        controller: 'TaskDetailsController'
                    }                    // tasks: function(TasksService, $stateParams) {
                    //     return TasksService.getByOfficeDocumentId($stateParams.id);
                    // },
                },
                resolve: {
                    entity: function (TasksService, $stateParams) {
                        return TasksService.getById($stateParams.entityId)
                    },
                    tasks: function (TasksService, $state, $stateParams) {
                        if($state.current.name.indexOf('byentity') !== -1){
                            return TasksService.getByProjectId(
                              $stateParams.entityId,
                              $stateParams.start,
                              $stateParams.limit,
                              $stateParams.sort
                            );
                        } else {
                            return TasksService.getSubTasks($stateParams.entityId)
                        }
                    }
                }
            })
            .state('main.tasks.byparent.activities', getDetailsTabState('task', 'activities'))
            .state('main.tasks.byparent.activities.modal', getDetailspaneModal())
            .state('main.tasks.byparent.documents', getDetailsTabState('task', 'documents'))
            .state('main.tasks.byparent.details', getTaskDetailsState())
            .state('main.tasks.byparent.details.activities', getDetailsTabState('task', 'activities'))
            .state('main.tasks.byparent.details.activities.modal', getDetailspaneModal())
            .state('main.tasks.byparent.details.documents', getDetailsTabState('task', 'documents'))


            .state('main.projects', {
                url: '/projects',
                views: {
                    middlepane: {
                        //hack around the fact that state current name is initialized in controller only
                        template: '',
                        controller: function ($state, discussions, context) {
                            if ($state.current.name === 'main.projects') {
                                if (discussions.data.length) {
                                    $state.go('.byentity', {
                                        entity: context.entityName,
                                        entityId: context.entityId
                                    });
                                } else {
                                    $state.go('.all');
                                }
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
                    projects: function (ProjectsService, $stateParams) {
                        if ($stateParams.starred) {
                            return ProjectsService.getStarred();
                        } else {
                        //    if (typeof ProjectsService.data !== 'undefined') {
                        //        $stateParams.limit = ProjectsService.data.length;
                        //    }
                            return ProjectsService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.projects.all.details', getProjectDetailsState())
            .state('main.projects.all.details.activities', getDetailsTabState('project', 'activities'))
            .state('main.projects.all.details.activities.modal', getDetailspaneModal())
            .state('main.projects.all.details.documents', getDetailsTabState('project', 'documents'))
            .state('main.projects.all.details.tasks', getDetailsTabState('project', 'tasks'))

            .state('main.projects.byentity', generateStateByEntity('project'))
            .state('main.projects.byentity.activities', getDetailsTabState('project', 'activities'))
            .state('main.projects.byentity.activities.modal', getDetailspaneModal())
            .state('main.projects.byentity.documents', getDetailsTabState('project', 'documents'))
            .state('main.projects.byentity.tasks', getDetailsTabState('project', 'tasks'))

            .state('main.projects.byentity.details', getProjectDetailsState())
            .state('main.projects.byentity.details.activities', getDetailsTabState('project', 'activities'))
            .state('main.projects.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.projects.byentity.details.documents', getDetailsTabState('project', 'documents'))
            .state('main.projects.byentity.details.tasks', getDetailsTabState('project', 'tasks'))

            .state('main.projects.byparent', {
                url: '/subProjects/:entityId',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/entity-list/entity-list.html',
                        controller: 'ProjectListController'
                    },
                    'detailspane@main': {
                        templateUrl: '/icu/components/project-details/project-details.html',
                        controller: 'ProjectDetailsController'
                    }                    // tasks: function(TasksService, $stateParams) {
                    //     return TasksService.getByOfficeDocumentId($stateParams.id);
                    // },
                },
                resolve: {
                    entity: function (ProjectsService, $stateParams) {
                        return ProjectsService.getById($stateParams.entityId)
                    },
                    projects: function (ProjectsService, $stateParams) {
                        return ProjectsService.getSubProjects($stateParams.entityId)

                    }
                }
            })
            .state('main.projects.byparent.activities', getDetailsTabState('project', 'activities'))
            .state('main.projects.byparent.activities.modal', getDetailspaneModal())
            .state('main.projects.byparent.documents', getDetailsTabState('project', 'documents'))
            .state('main.projects.byparent.details', getProjectDetailsState())
            .state('main.projects.byparent.details.activities', getDetailsTabState('project', 'activities'))
            .state('main.projects.byparent.details.activities.modal', getDetailspaneModal())
            .state('main.projects.byparent.details.documents', getDetailsTabState('project', 'documents'))


            .state('main.officeDocuments', {
                url: '/officeDocuments',
                views: {
                    middlepane: {
                        //hack around the fact that state current name is initialized in controller only
                        template: '',
                        controller: function ($state, discussions, context) {
                            if ($state.current.name === 'main.officeDocuments') {
                                if (discussions.data.length) {
                                    $state.go('.byentity', {
                                        entity: context.entityName,
                                        entityId: context.entityId
                                    });
                                } else {
                                    $state.go('.all');
                                }
                            }
                        }
                    }
                }
            })
            .state('main.officeDocuments.all', {
                url: '/all',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT,
                    officeDocuments:undefined,
                    activeTab: undefined,
                    status:undefined,
                    filterStatus:undefined,
                },
                views: getListView('officeDocument'),
                resolve: {
                    officeDocuments: function (OfficeDocumentsService, $stateParams) {
                        var docs = $stateParams.officeDocuments;
                        if(docs){
                            return docs;
                        }
                        else{
                            if ($stateParams.starred) {
                                return OfficeDocumentsService.getStarred();
                            } else {
                        //        if (typeof OfficeDocumentsService.data !== 'undefined') {
                         //           $stateParams.limit = OfficeDocumentsService.data.length;
                        //        }
                                localStorage.removeItem("type");
                                return OfficeDocumentsService.getAll($stateParams.start,
                                    $stateParams.limit,
                                    $stateParams.sort,
                                    $stateParams.status);
                            }
                        }
                    },
                    // firstTime: function($stateParams){
                    //     var docs = $stateParams.officeDocuments;
                    //     if(docs){
                    //         return false;
                    //     }else{
                    //         return true;
                    //     }
                    // }
                }
            })
            .state('main.officeDocuments.all.details', getOfficeDocumentDetailsState())
            .state('main.officeDocuments.all.details.activities', getDetailsTabState('officeDocument', 'activities'))
            .state('main.officeDocuments.all.details.activities.modal', getDetailspaneModal())
            .state('main.officeDocuments.all.details.documents', getDetailsTabState('officeDocument', 'documents'))
            .state('main.officeDocuments.all.details.tasks', getDetailsTabState('officeDocument', 'tasks'))

            .state('main.officeDocuments.byentity', generateStateByEntity('officeDocument'))
            .state('main.officeDocuments.byentity.activities', getDetailsTabState('officeDocument', 'activities'))
            .state('main.officeDocuments.byentity.activities.modal', getDetailspaneModal())
            .state('main.officeDocuments.byentity.documents', getDetailsTabState('officeDocument', 'documents'))
            .state('main.officeDocuments.byentity.tasks', getDetailsTabState('officeDocument', 'tasks'))

            .state('main.officeDocuments.byentity.details', getOfficeDocumentDetailsState())
            .state('main.officeDocuments.byentity.details.activities', getDetailsTabState('officeDocument', 'activities'))
            .state('main.officeDocuments.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.officeDocuments.byentity.details.documents', getDetailsTabState('officeDocument', 'documents'))
            .state('main.officeDocuments.byentity.details.tasks', getDetailsTabState('officeDocument', 'tasks'))

            .state('main.discussions', {
                url: '/discussions',
                views: {
                    middlepane: {
                        //hack around the fact that state current name is initialized in controller only
                        template: '',
                        controller: function ($state, projects, context) {
                            if ($state.current.name === 'main.discussions') {
                                if (projects.data.length) {
                                    $state.go('.byentity', {
                                        entity: context.entityName,
                                        entityId: context.entityId
                                    });
                                } else {
                                    $state.go('.all');
                                }
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
                    discussions: function (DiscussionsService, $stateParams) {
                        if ($stateParams.starred) {
                            return DiscussionsService.getStarred();
                        } else {
                      //      if (typeof DiscussionsService.data !== 'undefined') {
                      //          $stateParams.limit = DiscussionsService.data.length;
                       //     }
                            return DiscussionsService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.discussions.all.details', getDiscussionDetailsState())
            .state('main.discussions.all.details.activities', getDetailsTabState('discussion', 'activities'))
            .state('main.discussions.all.details.activities.modal', getDetailspaneModal())
            .state('main.discussions.all.details.documents', getDetailsTabState('discussion', 'documents'))
            .state('main.discussions.all.details.tasks', getDetailsTabState('discussion', 'tasks'))

            .state('main.discussions.byentity', generateStateByEntity('discussion'))
            .state('main.discussions.byentity.activities', getDetailsTabState('discussion', 'activities'))
            .state('main.discussions.byentity.activities.modal', getDetailspaneModal())
            .state('main.discussions.byentity.documents', getDetailsTabState('discussion', 'documents'))
            .state('main.discussions.byentity.tasks', getDetailsTabState('discussion', 'tasks'))

            .state('main.discussions.byentity.details', getDiscussionDetailsState())
            .state('main.discussions.byentity.details.activities', getDetailsTabState('discussion', 'activities'))
            .state('main.discussions.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.discussions.byentity.details.documents', getDetailsTabState('discussion', 'documents'))
            .state('main.discussions.byentity.details.tasks', getDetailsTabState('discussion', 'tasks'))


            .state('main.offices', {
                url: '/offices',
                views: {
                    middlepane: {
                        //hack around the fact that state current name is initialized in controller only
                        template: '',
                        controller: function ($state, discussions, context) {
                            if ($state.current.name === 'main.offices') {
                                if (discussions.data.length) {
                                    $state.go('.byentity', {
                                        entity: context.entityName,
                                        entityId: context.entityId
                                    });
                                } else {
                                    $state.go('.all');
                                }
                            }
                        }
                    }
                }
            })
            .state('main.offices.all', {
                url: '/all',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: getListView('office'),
                resolve: {
                    offices: function (OfficesService, $stateParams) {
                        if ($stateParams.starred) {
                            return OfficesService.getStarred();
                        } else {
                       //     if (typeof OfficesService.data !== 'undefined') {
                       //         $stateParams.limit = OfficesService.data.length;
                       //     }
                            return OfficesService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.offices.all.details', getOfficeDetailsState())
            .state('main.offices.all.details.activities', getDetailsTabState('office', 'activities'))
            .state('main.offices.all.details.activities.modal', getDetailspaneModal())
            .state('main.offices.all.details.documents', getDetailsTabState('office', 'documents'))
            .state('main.offices.all.details.folders', getDetailsTabState('office', 'folders'))
            .state('main.offices.all.details.signatures', getDetailsTabState('office', 'signatures'))

            .state('main.offices.byentity', generateStateByEntity('office'))
            .state('main.offices.byentity.activities', getDetailsTabState('office', 'activities'))
            .state('main.offices.byentity.activities.modal', getDetailspaneModal())
            .state('main.offices.byentity.documents', getDetailsTabState('office', 'documents'))
            .state('main.offices.byentity.folders', getDetailsTabState('office', 'folders'))
            .state('main.offices.byentity.signatures', getDetailsTabState('office', 'signatures'))

            .state('main.offices.byentity.details', getOfficeDetailsState())
            .state('main.offices.byentity.details.activities', getDetailsTabState('office', 'activities'))
            .state('main.offices.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.offices.byentity.details.documents', getDetailsTabState('office', 'documents'))
            .state('main.offices.byentity.details.folders', getDetailsTabState('office', 'folders'))
            .state('main.offices.byentity.details.signatures', getDetailsTabState('office', 'signatures'))

            .state('main.templateDocs', {
                url: '/templateDocs',
                views: {
                    middlepane: {
                        //hack around the fact that state current name is initialized in controller only
                        template: '',
                        controller: function ($state, discussions, context) {
                            if ($state.current.name === 'main.templateDocs') {
                                if (discussions.data.length) {
                                    $state.go('.byentity', {
                                        entity: context.entityName,
                                        entityId: context.entityId
                                    });
                                } else {
                                    $state.go('.all');
                                }
                            }
                        }
                    }
                }
            })
            .state('main.templateDocs.all', {
                url: '/all',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: getListView('templateDoc'),
                resolve: {
                    templateDocs: function (TemplateDocsService, $stateParams) {
                        if ($stateParams.starred) {
                            return TemplateDocsService.getStarred();
                        } else {
                     //       if (typeof TemplateDocsService.data !== 'undefined') {
                     //           $stateParams.limit = TemplateDocsService.data.length;
                     //       }
                            return TemplateDocsService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.templateDocs.all.details', getTemplateDocDetailsState())
            .state('main.templateDocs.all.details.activities', getDetailsTabState('templateDoc', 'activities'))
            .state('main.templateDocs.all.details.activities.modal', getDetailspaneModal())
            .state('main.templateDocs.all.details.documents', getDetailsTabState('templateDoc', 'documents'))
            .state('main.templateDocs.all.details.folders', getDetailsTabState('templateDoc', 'folders'))

            .state('main.templateDocs.byentity', generateStateByEntity('templateDoc'))
            .state('main.templateDocs.byentity.activities', getDetailsTabState('templateDoc', 'activities'))
            .state('main.templateDocs.byentity.activities.modal', getDetailspaneModal())
            .state('main.templateDocs.byentity.documents', getDetailsTabState('templateDoc', 'documents'))
            .state('main.templateDocs.byentity.folders', getDetailsTabState('templateDoc', 'folders'))

            .state('main.templateDocs.byentity.details', getTemplateDocDetailsState())
            .state('main.templateDocs.byentity.details.activities', getDetailsTabState('templateDoc', 'activities'))
            .state('main.templateDocs.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.templateDocs.byentity.details.documents', getDetailsTabState('templateDoc', 'documents'))
            .state('main.templateDocs.byentity.details.folders', getDetailsTabState('templateDoc', 'folders'))

            .state('main.folders', {
                url: '/folders',
                views: {
                    middlepane: {
                        //hack around the fact that state current name is initialized in controller only
                        template: '',
                        controller: function ($state, discussions, context) {
                            if ($state.current.name === 'main.folders') {
                                if (discussions.data.length) {
                                    $state.go('.byentity', {
                                        entity: context.entityName,
                                        entityId: context.entityId
                                    });
                                } else {
                                    $state.go('.all');
                                }
                            }
                        }
                    }
                }
            })
            .state('main.folders.all', {
                url: '/all',
                params: {
                    starred: false,
                    start: 0,
                    limit: LIMIT,
                    sort: SORT
                },
                views: getListView('folder'),
                resolve: {
                    folders: function (FoldersService, $stateParams) {
                        if ($stateParams.starred) {
                            return FoldersService.getStarred();
                        } else {
                     //       if (typeof FoldersService.data !== 'undefined') {
                     //           $stateParams.limit = FoldersService.data.length;
                     //       }
                            return FoldersService.getAll($stateParams.start,
                                $stateParams.limit,
                                $stateParams.sort);
                        }
                    }
                }
            })
            .state('main.folders.all.details', getFolderDetailsState())
            .state('main.folders.all.details.activities', getDetailsTabState('folder', 'activities'))
            .state('main.folders.all.details.activities.modal', getDetailspaneModal())
            .state('main.folders.all.details.documents', getDetailsTabState('folder', 'documents'))
            .state('main.folders.all.details.tasks', getDetailsTabState('folder', 'tasks'))
            .state('main.folders.all.details.officedocuments', getDetailsTabState('folder', 'officeDocuments'))

            .state('main.folders.byentity', generateStateByEntity('folder'))
            .state('main.folders.byentity.activities', getDetailsTabState('folder', 'activities'))
            .state('main.folders.byentity.activities.modal', getDetailspaneModal())
            .state('main.folders.byentity.documents', getDetailsTabState('folder', 'documents'))
            .state('main.folders.byentity.folders', getDetailsTabState('folder', 'folders'))
            .state('main.folders.byentity.officedocuments', getDetailsTabState('folder', 'officeDocuments'))

            .state('main.folders.byentity.details', getFolderDetailsState())
            .state('main.folders.byentity.details.activities', getDetailsTabState('folder', 'activities'))
            .state('main.folders.byentity.details.activities.modal', getDetailspaneModal())
            .state('main.folders.byentity.details.documents', getDetailsTabState('folder', 'documents'))
            .state('main.folders.byentity.details.tasks', getDetailsTabState('folder', 'tasks'))
            .state('main.folders.byentity.details.officedocuments', getDetailsTabState('folder', 'officeDocuments'))

            .state('main.adminSettings', {
                url: '/adminSettings',
                views: {
                    'mainpane@main': {
                        templateUrl: '/icu/components/admin/settings.html',
                        controller: 'adminSettingsController'
                    }
                }
            })

            .state('main.search', {
                url: '/search/:query',
                params: {
                    dateUpdated: 'active',
                    recycled:  null
                },
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/search-list/search-list.html',
                        controller: 'SearchListController'
                    },
                    'detailspane@main': {
                        templateUrl: '/icu/components/search-list/no-results.html',
                        controller: 'SearchListController'
                    }
                },
                resolve: {
                    results: function (EntityService,SearchService, $stateParams, $location) {
                        let query = $stateParams.query;
                        $stateParams.recycled = $location.search().recycled;

                        if ($stateParams.recycled == true)  {
                            $location.search('recycled', 'true');
                        }
                        if (query && query.length) {
                            if(query !== '___'){
                              SearchService.refreshQuery(query);
                            }
                            return SearchService.find(query);
                        } else {
                            if (SearchService.builtInSearchArray) {
                                var data = SearchService.builtInSearchArray.map(function (d) {
                                    d._type = 'task';
                                    return d;
                                });
                                return data;
                            } else {
                                SearchService.results = SearchService.filteringResults = [];
                                return [];
                            }
                        }
                     },
                    term: function ($stateParams) {
                        return $stateParams.query;
                    }
                }
            })
            .state('main.search.recycled', getRecycledEntities('recycled'))
            .state('main.search.task', getTaskDetailsState('/task'))
            .state('main.search.task.activities', getDetailsTabState('task', 'activities'))
            .state('main.search.task.activities.modal', getDetailspaneModal())
            .state('main.search.task.documents', getDetailsTabState('task', 'documents'))

            .state('main.search.project', getProjectDetailsState('/project'))
            .state('main.search.project.activities', getDetailsTabState('project', 'activities'))
            .state('main.search.project.activities.modal', getDetailspaneModal())
            .state('main.search.project.documents', getDetailsTabState('project', 'documents'))
            .state('main.search.project.tasks', getDetailsTabState('project', 'tasks'))

            // .state('main.search.officeDocument', getOfficeDocumentDetailsState('/officeDocument'))
            //     .state('main.search.officeDocument.activities', getDetailsTabState('officeDocument', 'activities'))
            //     .state('main.search.officeDocument.activities.modal', getDetailspaneModal())
            //     .state('main.search.officeDocument.documents', getDetailsTabState('officeDocument', 'documents'))
            //     .state('main.search.officeDocument.tasks', getDetailsTabState('officeDocument', 'tasks'))

            .state('main.search.discussion', getDiscussionDetailsState('/discussion'))
            .state('main.search.discussion.activities', getDetailsTabState('discussion', 'activities'))
            .state('main.search.discussion.activities.modal', getDetailspaneModal())
            .state('main.search.discussion.documents', getDetailsTabState('discussion', 'documents'))
            .state('main.search.discussion.tasks', getDetailsTabState('discussion', 'tasks'))

            .state('main.search.office', getOfficeDetailsState('/office'))
            .state('main.search.office.activities', getDetailsTabState('office', 'activities'))
            .state('main.search.office.activities.modal', getDetailspaneModal())
            .state('main.search.office.documents', getDetailsTabState('office', 'documents'))
            .state('main.search.office.tasks', getDetailsTabState('office', 'tasks'))

            .state('main.search.templateDoc', getTemplateDocDetailsState('/templateDoc'))
            .state('main.search.templateDoc.activities', getDetailsTabState('templateDoc', 'activities'))
            .state('main.search.templateDoc.activities.modal', getDetailspaneModal())
            .state('main.search.templateDoc.documents', getDetailsTabState('templateDoc', 'documents'))
            .state('main.search.templateDoc.tasks', getDetailsTabState('templateDoc', 'tasks'))

            .state('main.search.folder', getFolderDetailsState('/folder'))
            .state('main.search.folder.activities', getDetailsTabState('folder', 'activities'))
            .state('main.search.folder.activities.modal', getDetailspaneModal())
            .state('main.search.folder.documents', getDetailsTabState('folder', 'documents'))
            .state('main.search.folder.tasks', getDetailsTabState('folder', 'tasks'))

            .state('main.search.officeDocument', getOfficeDocumentDetailsState('/officeDocument'))
            .state('main.search.officeDocument.activities', getDetailsTabState('officeDocument', 'activities'))
            .state('main.search.officeDocument.activities.modal', getDetailspaneModal())
            .state('main.search.officeDocument.documents', getDetailsTabState('officeDocument', 'documents'))

            // .state('main.officeDocuments.byentity.details', getOfficeDocumentDetailsState())
            // .state('main.officeDocuments.byentity.details.activities', getDetailsTabState('officeDocument', 'activities'))
            // .state('main.officeDocuments.byentity.details.activities.modal', getDetailspaneModal())
            // .state('main.officeDocuments.byentity.details.documents', getDetailsTabState('officeDocument', 'documents'))
            // .state('main.officeDocuments.byentity.details.tasks', getDetailsTabState('officeDocument', 'tasks'))

            .state('main.search.attachment', getAttachmentDetailsState('/attachment'))
            .state('main.search.attachment.versions', getAttachmentDetailsTabState())

            //Add by OHAD 17.4.16
            .state('main.search.update', getAttachmentDetailsState('/attachment'))

            .state('main.search.update.versions', getAttachmentDetailsTabState())

            .state('files', {
                url: "/files/:y/:m/:d/:n.:f?view",
                controller: function (FilesService) {
                    FilesService.getByPath()
                }
            })
            .state('main.inbox', {
                url: '/inbox',
                views: {
                    'middlepane@main': {
                        templateUrl: '/icu/components/inbox/inbox.html',
                        controller: 'InboxListController'
                    },
                    'detailspane@main': {
                        templateUrl: '/icu/components/inbox/inbox-details.html',
                        controller: 'InboxListController'
                    }
                },
                resolve: {
                    activities: function (ActivitiesService, $stateParams) {
                        return ActivitiesService.getByUserId($stateParams.id);
                    }
                }
            })
            .state('main.inbox.recycled', getRecycledEntities('recycled'))
            .state('main.inbox.task', getTaskDetailsState('/task'))
            .state('main.inbox.task.activities', getDetailsTabState('task', 'activities'))
            .state('main.inbox.task.activities.modal', getDetailspaneModal())
            .state('main.inbox.task.documents', getDetailsTabState('task', 'documents'))

            .state('main.inbox.project', getProjectDetailsState('/project'))
            .state('main.inbox.project.activities', getDetailsTabState('project', 'activities'))
            .state('main.inbox.project.activities.modal', getDetailspaneModal())
            .state('main.inbox.project.documents', getDetailsTabState('project', 'documents'))
            .state('main.inbox.project.tasks', getDetailsTabState('project', 'tasks'))

            .state('main.inbox.discussion', getDiscussionDetailsState('/discussion'))
            .state('main.inbox.discussion.activities', getDetailsTabState('discussion', 'activities'))
            .state('main.inbox.discussion.activities.modal', getDetailspaneModal())
            .state('main.inbox.discussion.documents', getDetailsTabState('discussion', 'documents'))
            .state('main.inbox.discussion.tasks', getDetailsTabState('discussion', 'tasks'))

            .state('main.inbox.office', getOfficeDetailsState('/office'))
            .state('main.inbox.office.activities', getDetailsTabState('office', 'activities'))
            .state('main.inbox.office.activities.modal', getDetailspaneModal())
            .state('main.inbox.office.documents', getDetailsTabState('office', 'documents'))
            .state('main.inbox.office.tasks', getDetailsTabState('office', 'tasks'))

            .state('main.inbox.templateDoc', getTemplateDocDetailsState('/templateDoc'))
            .state('main.inbox.templateDoc.activities', getDetailsTabState('templateDoc', 'activities'))
            .state('main.inbox.templateDoc.activities.modal', getDetailspaneModal())
            .state('main.inbox.templateDoc.documents', getDetailsTabState('templateDoc', 'documents'))
            .state('main.inbox.templateDoc.tasks', getDetailsTabState('templateDoc', 'tasks'))

            .state('main.inbox.folder', getFolderDetailsState('/folder'))
            .state('main.inbox.folder.activities', getDetailsTabState('folder', 'activities'))
            .state('main.inbox.folder.activities.modal', getDetailspaneModal())
            .state('main.inbox.folder.documents', getDetailsTabState('folder', 'documents'))
            .state('main.inbox.folder.tasks', getDetailsTabState('folder', 'tasks'))

            .state('main.inbox.officeDocument', getOfficeDocumentDetailsState('/officeDocument'))
            .state('main.inbox.officeDocument.activities', getDetailsTabState('officeDocument', 'activities'))
            .state('main.inbox.officeDocument.activities.modal', getDetailspaneModal())
            .state('main.inbox.officeDocument.documents', getDetailsTabState('officeDocument', 'documents'))

        // .state('main.documents', {
        //     url: '/docuoments',
        //     views: {
        //         middlepane: {
        //             //hack around the fact that state current name is initialized in controller only
        //             template: '',
        //             controller: function($state, projects, context) {
        //                 if ($state.current.name === 'main.docuoments') {
        //                     if (projects.data.length) {
        //                         $state.go('.byentity', {
        //                             entity: context.entityName,
        //                             entityId: context.entityId
        //                         });
        //                     } else {
        //                         $state.go('.all');
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // })
        //     .state('main.documents.all', {
        //         url: '/all',
        //         params: {
        //             starred: false,
        //             start: 0,
        //             limit: LIMIT,
        //             sort: SORT
        //         },
        //         views: getListView('document'),
        //         resolve: {
        //             documents: function() {

        //                     return {
        //                         title:"txt"
        //                     }
        //                 }
        //         }
        //     });
    }
]);

angular.module('mean.icu').config(function ($i18nextProvider) {

    $i18nextProvider.options = {
        lng: window.config.lng,
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'he',
        resGetPath: '/icu/assets/locales/__lng__/__ns__.json',
        defaultLoadingValue: ''
    };
});
