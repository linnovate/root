'use strict';

angular.module('mean.icu.ui.entity', [])
.service('EntityService', function (ApiUri, $http, PaginationService, WarningsService, ActivitiesService, MeanSocket, SettingServices) {
    var activeStatusFilterValue = "default" ;

    function isActiveStatusAvailable() {
        console.log("isActiveStatusAvailable", SettingServices.activeStatusConfigured == null) ;
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



    return {
        isActiveStatusAvailable, isActiveStatusAvailable,
        getActiveStatusFilterValue: getActiveStatusFilterValue,
        setActiveStatusFilterValue: setActiveStatusFilterValue,
        activeStatusFilterValue: activeStatusFilterValue,
        getEntityActivityStatus: getEntityActivityStatus,
        activeToggleList, activeToggleList,        
    };
}) ;