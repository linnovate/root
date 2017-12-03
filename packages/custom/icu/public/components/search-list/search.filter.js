'use strict';

angular.module('mean.icu.ui.searchlistfilter', [])
.filter('searchResultsFilter', function (SearchService) {
	return function(results) {
		var filteringResults = SearchService.filteringResults.map(function(e) {
            return e.id
        });
        var out = [];
        for (var i=0; i< results.length; i++) {
            if (filteringResults.indexOf(results[i].id) > -1) {
                out.push(results[i])
            }
        }
        return out;
	}
});