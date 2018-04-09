'use strict';

angular.module('mean.icu.data.searchservice', [])
.service('SearchService', function($http, ApiUri, WarningsService) {

	var builtInSearchArray = false;
    var filteringData = [];
    var results = [];
    var query = '';
    var filteringResults = [];
    let filteringByUpdated = null ;

    function find(query) {
        var _this = this;
        return $http.get(ApiUri + '/search?term=' + query).then(function(result) {
            WarningsService.setWarning(result.headers().warning);
            var results = [];
            for (var property in result.data) {
                result.data[property].forEach(function(entity) {
                    entity._type = property;
                    results.push(entity);
                });
            }
            _this.results = _this.filteringResults = results;
            // TODO: the following map should be refactored + removed.
            _this.results.map(function(d) {
                d._type == "officedocument" ? d._type="officeDocument" : d._type ;
                d.title = Array.isArray(d.title) ? [d.title] : [d.title]; // this resolves bug https://github.com/linnovate/root/issues/625
                return d ;
            })
            return results;
        });
    }

    function refreshQuery(term){
        query = term;
    }

    function getQuery(){
        return query;
    }

    function clearResults(){
        this.filteringData = [];
        this.results = [];
        this.filteringResults = [];
    }

    return {
        find: find,
        builtInSearchArray: builtInSearchArray,
        filteringData: filteringData,
        filteringResults: filteringResults,
        filteringByUpdated: filteringByUpdated,
        clearResults: clearResults,
        query: query,
        getQuery: getQuery,
        refreshQuery: refreshQuery,
    };
});



