'use strict';

angular.module('mean.icu.data.settingsservice', [])
.service('SettingServices', function($http, WarningsService) {
    function getAll() {
        return $http.get('/api/admin/moduleSettings/icu').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    return {
        getAll: getAll
    };
});
