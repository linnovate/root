'use strict';

angular.module('mean.icu.data.paginationservice', [])
.service('PaginationService', function ($http, $q) {
    function loadMore(url) {
        console.log(url);
        if (!url) {
            return function() {
                var promise = $q.when({
                    data: [],
                    next: function() { return promise; },
                    prev: function() { return promise; }
                });

                return promise;
            }
        } else {
            return function() {
                return $http.get(url).then(function(result) {
                    return processResponse(result.data);
                });
            };
        }
    }

    function processResponse(data) {
        console.log("datatot:");
        console.log("data", data);
        console.log("data.next", data.next);
        return {
            data: data.content || data,
            next: loadMore(data.next),
            prev: loadMore(data.prev)
        };
    }

    return {
        processResponse: processResponse
    };
});
