'use strict';

angular.module('mean.icu.data.eventdropsservice', [])
    .service('EventDropsService', function ($http, ApiUri, $stateParams, WarningsService, $rootScope) {
        var EntityPrefix = '/event-drops';

        function getAll() {
            console.log(ApiUri + EntityPrefix, 'orit13');

            return $http.get(ApiUri + EntityPrefix).then(function (result) {
                WarningsService.setWarning(result.headers().warning);
                console.log($rootScope.warning, result, '$rootScope.warning')
                return result.data;
            }, function (err) {
                return err
            }).then(function (some) {
                var dataArray = [];
                for (var index in some) {
                    var obj = {};
                    obj.name = index;
                    obj.data = some[index].map(function (o) {
                        o.date = o.created;
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
