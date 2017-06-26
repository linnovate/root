'use strict';

angular.module('mean.icu').controller('EventDropsController',
    function ($rootScope,
        $scope,
        EventDropsService) {

        EventDropsService.getAll().then(function (data) {
            console.log('orit12', data);
        });
    });
