'use strict';

angular.module('mean.mean-socket').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('Mean socket help page', {
            url: '/help2',
            templateUrl: 'mean-socket/views/index2.html'
            // url: '/help1',
            // templateUrl: 'mean-socket/views/index1.html'
            // url: '/help',
            // templateUrl: 'mean-socket/views/index.html'
        });
    }
]);
