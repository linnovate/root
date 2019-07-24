"use strict";

angular
  .module("mean.icu.data.eventdropsservice", [])
  .service("EventDropsService", function(
    $http,
    ApiUri,
    $stateParams,
    WarningsService,
    $rootScope
  ) {
    var EntityPrefix = "/event-drops";

    function getAll() {
      return $http
        .get(ApiUri + EntityPrefix)
        .then(
          function(result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
          },
          function(err) {
            return err;
          }
        )
        .then(function(response) {
          var dataArray = [];
          for (var index in response) {
            var obj = {};
            obj.name = index;
            obj.data = response[index].map(function(o) {
              o.date = o.created;
              o.title = o.title || o.name || "";
              o.type = index;
              return o;
            });
            dataArray.push(obj);
          }
          return dataArray;
        });
    }

    return {
      getAll: getAll
    };
  });
