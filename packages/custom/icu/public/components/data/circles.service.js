'use strict';

angular.module('mean.icu.data.circlesservice', [])
.service('circlesService', function (ApiUri, $http) {
	function getc19nList() {
		return $http.get(ApiUri + '/circles/sources').then(function (result) {
			console.log('r',result.data)
	        return result.data;
	    });
	}
	
    return {
        getc19nList: getc19nList,
    };
});
