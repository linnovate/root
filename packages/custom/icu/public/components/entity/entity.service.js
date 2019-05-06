'use strict';

angular.module('mean.icu.ui.entity', []).service('EntityService', function (ApiUri, $http, $stateParams, PaginationService, WarningsService, ActivitiesService, SettingServices) {
    var activeStatusFilterValue = "default";
    var SortFilterValue = {
        field:"created",
        order: -1
    };
    var entityFolderValue = {}
    if($stateParams.entity == "folder"){
        entityFolderValue.id = $stateParams.entityId;
    }

    var entityTypes = ['projects', 'tasks', 'discussions', 'updates', 'offices', 'folders', 'officeDocuments'];

    function getByEntityId(type, id) {
        var entityType = entityTypes.find(function (elem) {
            return elem.includes(type);
        });

        if (entityType == null) return Promise.resolve(null);
        return $http.get(ApiUri + '/' + entityType + '/' + id).then(function (result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }


    function isActiveStatusAvailable() {
        return SettingServices.activeStatusConfigured == null ? false : true ;
    }

    function getActiveStatusFilterValue() {
        return activeStatusFilterValue ;
    }

    function setActiveStatusFilterValue(_activeStatusFilterValue) {
        activeStatusFilterValue = _activeStatusFilterValue ;
    }


    function setSortFilterValue(_sortFilterValue) {
       SortFilterValue = _sortFilterValue
    }

    function getSortFilterValue() {
        return SortFilterValue;
    }

    function getEntityActivityStatus(filterValue, entityType, entityStatus) {
        return SettingServices.getIsActiveStatus(filterValue, entityType, entityStatus);
    }

    function setEntityFolderValue(_entity, _id) {
        entityFolderValue.entity = _entity;
        entityFolderValue.id = _id;
    }

    function getEntityFolderValue() {
        return entityFolderValue;
    }

    var activeToggleList = [{
        title: 'Active',
        value: 'active'
    }, {
        title: 'Archived',
        value: 'nonactive'
    }, {
        title: 'All',
        value: 'all'
    }];


    function recycle(type,id) {
        return $http.patch(ApiUri + '/' + type +  '/' + id + '/recycle').then(function (result) {
            
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function recycleRestore(type,id) {
        return $http.patch(ApiUri + '/' + type +  '/' + id + '/recycle_restore').then(function (result) {
            
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    function getRecycleBin(type) {
    	return $http.get(ApiUri + '/' + type + '/get_recycle_bin').then(function (result) {
    		WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }
    function getSearchAll(type) {
    	return $http.get(ApiUri  + '/get_search_all').then(function (result) {
    		WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }


    return {
        getByEntityId: getByEntityId,
        isActiveStatusAvailable, isActiveStatusAvailable,
        getActiveStatusFilterValue: getActiveStatusFilterValue,
        setActiveStatusFilterValue: setActiveStatusFilterValue,
        getSortFilterValue: getSortFilterValue,
        setSortFilterValue: setSortFilterValue,
        activeStatusFilterValue: activeStatusFilterValue,
        getEntityActivityStatus: getEntityActivityStatus,
        activeToggleList: activeToggleList,
        setEntityFolderValue: setEntityFolderValue,
        getEntityFolderValue: getEntityFolderValue,
        recycle: recycle,
        recycleRestore: recycleRestore,
        getRecycleBin: getRecycleBin

    };
}) ;
