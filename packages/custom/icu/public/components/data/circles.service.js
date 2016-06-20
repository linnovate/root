'use strict';

angular.module('mean.icu.data.circlesservice', [])
.service('circlesService', function (ApiUri, $http) {
	function getc19nSources() {
		return $http.get(ApiUri + '/circles/sources/c19n').then(function (result) {
	        return result.data;
	    });
	}

	function getc19n() {
		return $http.get(ApiUri + '/circles/all').then(function (result) {
	        return result.data;
	    });
	}

    return {
        getc19nSources: getc19nSources,
        getc19n: getc19n
    };
});
