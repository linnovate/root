'use strict';

angular.module('mean.icu.data.discussionsservice', [])
.service('DiscussionsService', function() {

    var discussions = [{
        name: 'Project review',
        id: 1,
        active: true
    }, {
        name: 'Weekly review',
        id: 2,
        active: false
    }, {
        name: 'QBR',
        id: 3,
        active: false
    }];

    function getAll() {
        return discussions;
    }

    return {
        getAll: getAll
    };
});
