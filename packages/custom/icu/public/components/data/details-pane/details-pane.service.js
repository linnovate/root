'use strict';

angular.module('mean.icu.data.detailspaneservice', [])
.service('DetailsPaneService', function () {
    function orderTabs(tabs) {
        let defaultTab = window.config.defaultTab || 'activities';
        let defaultTabIndex = tabs.indexOf(defaultTab);
        if(defaultTabIndex !== -1) {
            tabs.splice(defaultTabIndex, 1);
            tabs.unshift(defaultTab);
        }
        return tabs;
    }
    return {
        orderTabs
    };
});
