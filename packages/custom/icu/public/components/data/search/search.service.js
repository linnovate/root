'use strict';

angular.module('mean.icu.data.searchservice', [])
.service('SearchService', function($http, $stateParams, ApiUri, WarningsService, PaginationService) {

  let builtInSearchArray = false,
    filteringData = [],
    results = [], counts = [],
    query = '',
    filteringResults = [],
    filteringByUpdated = null ;

    function find(query, docType) {
        let _this = this,
          qs = {
            start: 0,
            limit: 25
        };
        if(docType)qs.docType = docType;
        qs = '?' + querystring.encode(qs) + '&';

        return $http.get(ApiUri + '/search' + qs + 'term=' + query).then(function(result) {
            WarningsService.setWarning(result.headers().warning);
            let results = [], counts;
            for (let property in result.data.content) {
                if(property === 'count'){
                  counts = result.data.content[property];
                  _this.counts = counts;
                  continue;
                }

                result.data.content[property].forEach(function(entity) {
                    entity._type = property;
                    results.push(entity);
                });
            }
            _this.results = _this.filteringResults = results;
            // TODO: the following map should be refactored + removed.
            _this.results.map(function(d) {
                d._type === "officedocument" ? d._type = "officeDocument" : d._type ;
                d.title = Array.isArray(d.title) ? [d.title] : [d.title]; // this resolves bug https://github.com/linnovate/root/issues/625
                return d ;
            });

            result.data.content = results;
            return {
              data:result.data,
              counts: counts
            };
        }).then(result => {
          let {data, counts} = result;
          data = PaginationService.processResponse(data);
          data.counts = counts;
          return data;
      })
    }

    function setFilteringResults(filteringRes){
        filteringResults = filteringRes;
    }

    function getFilteringResults(filteringRes){
        return filteringResults;
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
        setFilteringResults: setFilteringResults,
        getFilteringResults: getFilteringResults,
        filteringByUpdated: filteringByUpdated,
        clearResults: clearResults,
        query: query,
        getQuery: getQuery,
        refreshQuery: refreshQuery,
    };
});



