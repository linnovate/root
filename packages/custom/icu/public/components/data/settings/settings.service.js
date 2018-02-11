'use strict';

angular.module('mean.icu.data.settingsservice', [])
.service('SettingServices', function($http, WarningsService) {
    
    function getAll() {
        return $http.get('/api/admin/moduleSettings/icu').then(function(result) {
        	WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }

    let statusList = {
        task: ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'],
        project: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
        discussion: ['new', 'scheduled', 'done', 'canceled', 'archived'],
        officedocument: ['new', 'in-progress', 'received', 'done','sent']
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
//        console.log(type) ;
        configNonActiveStatus = configNonActiveStatus ? configNonActiveStatus : statusList.Typed(type) ;
        let nonActiveStatus = new Set(Object.values(configNonActiveStatus)) ;
        let typeStatusLowerCase =  statusList.Typed(type).map(element => element.toLowerCase());
        let typeStatuses = new Set(typeStatusLowerCase) ;
        
        let difference = new Set(
            [...typeStatuses].filter(x => !nonActiveStatus.has(x)));
//        console.log("getActiveStatuses - difference",difference) ;
        return Array.from(difference) ;
    }

    function getNonActiveStatuses(type) {
        configNonActiveStatus = configNonActiveStatus ? configNonActiveStatus : statusList.Typed(type) ;     
        let nonActiveStatus = new Set(Object.values(configNonActiveStatus)) ;
        let typeStatusLowerCase =  statusList.Typed(type).map(element => element.toLowerCase());        
        let typeStatuses = new Set(typeStatusLowerCase) ;
        let intersection = new Set(
            [...typeStatuses].filter(x => nonActiveStatus.has(x)));
//        console.log("intersection",Array.from(intersection)) ;
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
//                console.log("getIsActiveStatus active statuses", arr) ;
                return arr ? true : false ;
                break ;
            case 'nonactive':            
                arr = getNonActiveStatuses(type).find(element => typeStatusLowerCase == element) ;
//                console.log("getIsActiveStatus nonactive statuses", arr) ;
                return arr ? true : false ;
                break ;
            case 'all': 
//                console.log("getIsActiveStatus ALL") ;
                return true;
        }
    }

    return {
        getAll: getAll,
        getActiveStatuses: getActiveStatuses,
        getNonActiveStatuses: getNonActiveStatuses,
        getIsActiveStatus: getIsActiveStatus,
        activeStatusConfigured: activeStatusConfigured
    };
});
