'use strict';

angular.module('mean.icu.ui.searchlistfilter', [])
.filter('filteringByUpdated', function (SearchService) {
        return function(results) {
            var filteringResults = SearchService.filteringResults.map(function(e) {
                // console.log("filter date", SearchService.filteringByUpdated) ;
                // console.log("entity update", e.updated) ;
                let res =  new Date(e.updated) > new Date(SearchService.filteringByUpdated); // true if time1 is later
//                console.log(res) ;
                return res ? e.id : -1 ;
            });
            
            var out = [];
            for (var i=0; i< results.length; i++) {
                if (filteringResults.indexOf(results[i].id) > -1) {
                    out.push(results[i])
                }
            }
            return out;
        }
    return out = filteringResults ;
    })

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
})
.filter('searchResultsLength', function (SearchService) {
    return function(length) {
        return  SearchService.filteringResults.length;
    }
    
});