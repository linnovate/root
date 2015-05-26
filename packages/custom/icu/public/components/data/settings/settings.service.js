'use strict';

angular.module('mean.icu.data.settingsservice', [])
.service('SettingServices', function($http) {
    function getAll() {
        return $http.get('/api/admin/moduleSettings/icu').then(function(result) {
            return result.data;
        });
    }

    return {
        getAll: getAll
    };
});
