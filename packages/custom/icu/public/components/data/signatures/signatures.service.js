'use strict';

angular.module('mean.icu.data.signaturesservice', [])
.service('SignaturesService', function(ApiUri, $http, PaginationService, TasksService, $rootScope, WarningsService, ActivitiesService) {
    var EntityPrefix = '/signatures';
    var data, selected;

    function getByOfficeId(id) {
        return $http.get(ApiUri + EntityPrefix + '/getByOfficeId/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function create(signature) {
        return $http.post(ApiUri + EntityPrefix+'/create', signature).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            NotifyingService.notify('createdElement');
            return result.data;
        });
    }

    function remove(id) {
        return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }


    return {
        getByOfficeId:getByOfficeId,
        remove:remove,
        create:create
    };
});
