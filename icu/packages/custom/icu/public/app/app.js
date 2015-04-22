'use strict';

angular.module('mean.icu').config([
    '$meanStateProvider',
    function($meanStateProvider) {
        $meanStateProvider
        .state('main', {
            abstract: true,
            url: '',
            templateUrl: 'icu/components/icu/icu.html'
        })
        .state('main.people', {
            url: '/people',
            views: {
                middlepane: {
                    templateUrl: 'icu/components/user-list/user-list.html'
                },
                detailspane: {
                    templateUrl: 'icu/components/user-details/user-details.html'
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
