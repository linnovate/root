'use strict';

angular.module('mean.icu.data.settingsservice', [])
.service('SettingServices', function($http, WarningsService) {
    'use strict';
    
    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
    
    function getAll() {
        return $http.get('/api/admin/moduleSettings/icu').then(function (result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
        });
    }
    
    var statusList = {
        task: ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'],
        project: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
        discussion: ['new', 'scheduled', 'done', 'canceled', 'archived'],
        officedocument: ['new', 'in-progress', 'received', 'done', 'sent']
    };

    function values(obj){
        Object.keys(obj).map(function(key){
            return obj[key];
        });
    }
    
    var activeStatusConfigured = config.activeStatus && config.activeStatus.nonActiveStatus ? true : false;
    var configNonActiveStatus = config.activeStatus && config.activeStatus.nonActiveStatus ? config.activeStatus.nonActiveStatus : null;
    
    function getActiveStatuses(type) {
        configNonActiveStatus = configNonActiveStatus ? configNonActiveStatus : statusList[type];
        var nonActiveStatus = new Set(values(configNonActiveStatus));
        var typeStatusLowerCase = statusList[type].map(function (element) {
            return element.toLowerCase();
        });
        var typeStatuses = new Set(typeStatusLowerCase);
    
        var difference = new Set([].concat(_toConsumableArray(typeStatuses)).filter(function (x) {
            return !nonActiveStatus.has(x);
        }));
        //        console.log("getActiveStatuses - difference",difference) ;
        return Array.from(difference);
    }
    
    function getNonActiveStatuses(type) {
        configNonActiveStatus = configNonActiveStatus ? configNonActiveStatus : statusList[type];
        var nonActiveStatus = new Set(values(configNonActiveStatus));
        var typeStatusLowerCase = statusList[type].map(function (element) {
            return element.toLowerCase();
        });
        var typeStatuses = new Set(typeStatusLowerCase);
        var intersection = new Set([].concat(_toConsumableArray(typeStatuses)).filter(function (x) {
            return nonActiveStatus.has(x);
        }));
        //        console.log("intersection",Array.from(intersection)) ;
        return Array.from(intersection);
    }
    
    function getIsActiveStatus(filter, type, status) {
        if (status == null) {
            // if the status isn't defined, well consider it as active.
            return true;
        }
    
        var typeStatusLowerCase = status.toLowerCase();
        var arr = [];
        switch (filter) {
            default:
            case 'active':
                arr = getActiveStatuses(type).find(function (element) {
                    return typeStatusLowerCase == element;
                });
                //                console.log("getIsActiveStatus active statuses", arr) ;
                return arr ? true : false;
                break;
            case 'nonactive':
                arr = getNonActiveStatuses(type).find(function (element) {
                    return typeStatusLowerCase == element;
                });
                //                console.log("getIsActiveStatus nonactive statuses", arr) ;
                return arr ? true : false;
                break;
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
