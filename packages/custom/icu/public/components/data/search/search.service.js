'use strict';

angular.module('mean.icu.data.searchservice', [])
.service('SearchService', function($http, ApiUri) {
    function find(query) {
        return $http.get(ApiUri + '/search?term=' + query).then(function(result) {
            var results = [];

            for (var property in result.data) {
                result.data[property].forEach(function(entity) {
                    entity._type = property;
                    results.push(entity);
                });
            }

            return results;
        });
    }

    return {
        find: find
    };
});
