'use strict';

angular.module('mean.icu').config([
    '$meanStateProvider',
    function($meanStateProvider) {
        $meanStateProvider
        .state('main', {
            abstract: true,
            url: '',
            templateUrl: 'icu/components/icu/icu.html',
            controller: 'IcuController'
        })
        .state('main.people', {
            url: '/people',
            views: {
                middlepane: {
                    templateUrl: 'icu/components/user-list/user-list.html',
                    controller: 'UserListController',
                    resolve: {
                        users: function(UsersService, $stateParams) {
                            return UsersService.getAll();
                        }
                    }
                },
                detailspane: {
                    templateUrl: 'icu/components/user-details/no-user-selected.html'
                }
            }
        })
        .state('main.people.details', {
            url: '/:id',
            views: {
                'detailspane@main': {
                    templateUrl: 'icu/components/user-details/user-details.html',
                    controller: 'UserDetailsController',
                    resolve: {
                        user: function(UsersService, $stateParams) {
                            return UsersService.getById(+$stateParams.id);
                        },
                        users: function(UsersService, $stateParams) {
                            return UsersService.getAll();
                        },
                        notifications: function(NotificationsService) {
                            return NotificationsService.getAll();
                        }

                    }
                }
            }
        })
        .state('main.people.details.projects', {
            url: '/projects',
            views: {
                tab: {
                    templateUrl: 'icu/components/user-tabs/user-projects.html',
                }
            }
        })
        .state('main.people.details.tasks', {
            url: '/tasks',
            views: {
                tab: {
                    templateUrl: 'icu/components/user-tabs/user-tasks.html',
                }
            }
        })
        .state('main.people.details.activities', {
            url: '/activities',
            views: {
                tab: {
                    templateUrl: 'icu/components/user-tabs/user-activities.html',
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
                    templateUrl: 'icu/components/user-tabs/user-documents.html',
                }
            }
        })
        .state('main.tasks', {
            url: '/tasks',
            views: {
                middlepane: {
                    templateUrl: 'icu/components/task-list/task-list.html'
                },
                detailspane: {
                    templateUrl: 'icu/components/task-details/task-details.html'
                }
            }
        });
    }
]);

angular.module('mean.icu').controller('IcuController', function($rootScope) {
    $rootScope.$on('$stateChangeError', function() {
        console.log(arguments);
    });
    $rootScope.$on('$stateChangeSuccess', function() {
        console.log(arguments);
    });
});
