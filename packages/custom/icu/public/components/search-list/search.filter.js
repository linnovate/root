'use strict';

angular.module('mean.icu.ui.searchlistfilter', [])
.filter('filteringByUpdated', function (SearchService,$location) {    
    return function(results) {  
        if($location.search() && $location.search().recycled) {
          SearchService.filteringResults = [];
          for(var i = 0;i<results.length;i++){
              console.log('elassssssssss',results[i])
              if(results[i].recycled)
              SearchService.filteringResults.push(results[i])
          }
        }
        else {
             SearchService.filteringResults = [];
            for(var i = 0;i<results.length;i++){
            if(!results[i].recycled)
                SearchService.filteringResults.push(results[i])
            }

        }

        var filteringResults = SearchService.filteringResults.map(function(e) {
            let filterDate = new Date(SearchService.filteringByUpdated) ;
            let entityDate = new Date(e.updated) ;
//          console.log(filterDate, entityDate) ; 
            let res =  entityDate > filterDate ? true : false ; // true if time1 is later
//          console.log(res) ;
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
.filter('searchResultsFilter', function (SearchService,$location) {
	return function(results) {
        if ($location.path().indexOf('recycle') ) {
            SearchService.filteringResults = results ;     
        }

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