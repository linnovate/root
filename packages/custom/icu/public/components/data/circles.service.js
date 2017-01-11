'use strict';

angular.module('mean.icu.data.circlesservice', [])
.service('circlesService', function (ApiUri, $http, WarningsService) {
	function getc19nSources() {
		return $http.get(ApiUri + '/circles/sources').then(function (result) {
			WarningsService.setWarning(result.headers().warning);
	        return result.data;
	    });
	}

	function getc19n() {
		return $http.get(ApiUri + '/circles/all').then(function (result) {
			WarningsService.setWarning(result.headers().warning);
	        return result.data;
	    });
	}

	function getmine() {
		return $http.get(ApiUri + '/circles/mine').then(function (result) {
			WarningsService.setWarning(result.headers().warning);
	        return result.data;
	    });
	}

    return {
        getc19nSources: getc19nSources,
        getc19n: getc19n,
        getmine: getmine
    };
});
