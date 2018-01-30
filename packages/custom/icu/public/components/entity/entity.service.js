'use strict';

angular.module('mean.icu.ui.entity', [])
.service('EntityService', function (ApiUri, $http, PaginationService, WarningsService, ActivitiesService, MeanSocket, SettingServices) {
    var activeStatusFilterValue = "default" ;

    function isActiveStatusAvailable() {
        return SettingServices.activeStatusConfigured == null ? false : true ;
    }

    function getActiveStatusFilterValue() {
        return activeStatusFilterValue ;
    }

    function setActiveStatusFilterValue(_activeStatusFilterValue) {
        activeStatusFilterValue = _activeStatusFilterValue ;
    }

    function getEntityActivityStatus(filterValue,entityType,entityStatus) {
        return SettingServices.getIsActiveStatus(filterValue,entityType,entityStatus)  ;
    }

    let activeToggleList = [
		{
			title: 'Active',
			value: 'active'
		}, {
			title: 'Archived',
			value: 'nonactive'
		},
		{
			title: 'All',
			value: 'all'
		}
	];


    function recycle(type,id) {
        console.log('calling entityService recycle', type, id);
        return $http.patch(ApiUri + '/' + type +  '/' + id + '/recycle').then(function (result) {
            
            console.log("recycle returned:" ,result) ;
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function recycleRestore(type,id) {
        console.log('calling entityService recycle', type, id);
        return $http.patch(ApiUri + '/' + type +  '/' + id + '/recycle_restore').then(function (result) {
            
            console.log("recycle returned:" ,result) ;
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    return {
        isActiveStatusAvailable, isActiveStatusAvailable,
        getActiveStatusFilterValue: getActiveStatusFilterValue,
        setActiveStatusFilterValue: setActiveStatusFilterValue,
        activeStatusFilterValue: activeStatusFilterValue,
        getEntityActivityStatus: getEntityActivityStatus,
        activeToggleList, activeToggleList,   
        recycle, recycle,  
        recycleRestore, recycleRestore,   
    };
}) ;
