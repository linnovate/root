'use strict';

angular.module('mean.icu.data.activitiesservice', [])
.service('ActivitiesService', function($http) {
    function getByUserId(id) {
        return [];
    }

    return {
        getByUserId: getByUserId
    };
});
