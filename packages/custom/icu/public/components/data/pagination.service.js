"use strict";

angular
  .module("mean.icu.data.paginationservice", [])
  .service("PaginationService", function($http, $q, WarningsService) {
    function loadMore(url) {
      if (!url) {
        return function() {
          var promise = $q.when({
            data: [],
            next: function() {
              return promise;
            },
            prev: function() {
              return promise;
            }
          });

          return promise;
        };
      } else {
        return function() {
          return $http.get(url).then(function(result) {
            WarningsService.setWarning(result.headers().warning);
            return processResponse(result.data);
          });
        };
      }
    }

    function processResponse(data) {
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
