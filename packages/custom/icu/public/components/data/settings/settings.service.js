'use strict';

angular.module('mean.icu.data.settingsservice', [])
.service('SettingServices', function($http, WarningsService) {

    // var userFilter = ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done', 'archived','canceled','completed'];

    function getAll() {
        return $http.get('/api/admin/moduleSettings/icu').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    let statusList = {
        task: ['new', 'assigned', 'in-progress', 'waiting-approval', 'review', 'rejected', 'done'],
        project: ['new', 'assigned','in-progress', 'canceled', 'waiting-approval', 'completed', 'archived'],
        discussion: ['new', 'scheduled', 'done', 'canceled', 'waiting-approval', 'archived'],
        officeDocument: ['new', 'in-progress', 'received', 'done', 'waiting-approval','sent'],
        folder: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
        office: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
        templateDocument: ['new', 'in-progress', 'canceled', 'completed', 'archived']
    }

    function getStatusList (){
        return statusList;
    }
    function getActiveStatusList (){
        return ['new', 'assigned', 'in-progress', 'review'];
    }
    function getNonActiveStatusList (){
        return ['rejected', 'done', 'archived','canceled','completed'];
    }
    function getUserFilter (){
        return ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done', 'archived','canceled','completed'];
    }


    statusList.Typed = function(type) {
        if(type == "all") {
            // someone (search) is asking for a mixed list of all the statuses to check for activity...
            let merged = new Set([...this["task"], ...this["project"], ...this["discussion"], ...this["officedocument"]]) ;
            return Array.from(merged) ;
        }
        return this[type]  ;
    }

    let activeStatusConfigured = config.activeStatus && config.activeStatus.nonActiveStatus ? true : false ;
    let configNonActiveStatus = config.activeStatus && config.activeStatus.nonActiveStatus ? config.activeStatus.nonActiveStatus : null ;

    function getActiveStatuses(type) {
        configNonActiveStatus = configNonActiveStatus ? configNonActiveStatus : statusList.Typed(type) ;
        let nonActiveStatus = new Set(Object.values(configNonActiveStatus)) ;
        let typeStatusLowerCase =  statusList.Typed(type).map(element => element.toLowerCase());
        let typeStatuses = new Set(typeStatusLowerCase) ;

        let difference = new Set(
            [...typeStatuses].filter(x => !nonActiveStatus.has(x)));
        return Array.from(difference) ;
    }

    function getNonActiveStatuses(type) {
        configNonActiveStatus = configNonActiveStatus ? configNonActiveStatus : statusList.Typed(type) ;
        let nonActiveStatus = new Set(Object.values(configNonActiveStatus)) ;
        let typeStatusLowerCase =  statusList.Typed(type).map(element => element.toLowerCase());
        let typeStatuses = new Set(typeStatusLowerCase) ;
        let intersection = new Set(
            [...typeStatuses].filter(x => nonActiveStatus.has(x)));
        return Array.from(intersection) ;
    }


    function getIsActiveStatus(filter,type,status) {
        if(status == null) {
            // if the status isn't defined, well consider it as active.
            return true ;
        }

        let typeStatusLowerCase =  status.toLowerCase();
        let arr = [] ;
        switch (filter) {
            default:
            case 'active':
                arr = getActiveStatuses(type).find(element => typeStatusLowerCase == element) ;
                return arr ? true : false ;
                break ;
            case 'nonactive':
                arr = getNonActiveStatuses(type).find(element => typeStatusLowerCase == element) ;
                return arr ? true : false ;
                break ;
            case 'all':
                return true;
        }
    }

    return {
        getAll: getAll,
        getActiveStatuses: getActiveStatuses,
        getNonActiveStatuses: getNonActiveStatuses,
        getIsActiveStatus: getIsActiveStatus,
        activeStatusConfigured: activeStatusConfigured,
        getStatusList: getStatusList,
        getActiveStatusList: getActiveStatusList,
        getNonActiveStatusList: getNonActiveStatusList,
        getUserFilter: getUserFilter
    };
});
