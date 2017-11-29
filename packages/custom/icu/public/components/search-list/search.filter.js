'use strict';

angular.module('mean.icu.ui.rows', [])
.filter('searchFilter', function (SearchService) {
	return function(results) {
		var out = [];
        var filtering = SearchService.filteringData;
        for (var i=0; i< results.length; i++) {
                    console.log(filtering.entity,  results[i]._type, results[i]._type == filtering.entity)

            if (results[i]._type == filtering.entity) {
                out.push(results[i])
            }
        }
		
		return out;
	}
});