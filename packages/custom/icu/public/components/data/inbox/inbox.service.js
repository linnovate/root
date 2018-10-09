'use strict';

angular.module('mean.icu.data.inboxservice', [])
    .service('InboxService', function(ApiUri, $http, $stateParams, WarningsService
    ) {
        var EntityPrefix = '/inbox';

        function getUpdateEntities(activities) {
            return $http.post(ApiUri + EntityPrefix, activities)
                .then(result => {
                        WarningsService.setWarning(result.headers().warning);
                        return result.data;
                    },err => console.error(err)
                );
        }

        return {
            getUpdateEntities: getUpdateEntities,
        };
    });
