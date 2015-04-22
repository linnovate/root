'use strict';

angular.module('mean.icu').config([
    '$meanStateProvider',
    function($meanStateProvider) {
        $meanStateProvider
        .state('main', {
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
        });
    }
]);
