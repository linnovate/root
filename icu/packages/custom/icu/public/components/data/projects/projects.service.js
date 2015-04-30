'use strict';

angular.module('mean.icu.data.projectsservice', [])
.service('ProjectsService', function() {
    var projects = [{
        name: 'ICU',
        id: 1,
        color: 'green',
        tasks: 12
    }, {
        name: 'Linnovate',
        id: 2,
        color: 'blue',
        tasks: 14
    }, {
        name: 'Pixel',
        id: 3,
        color: 'pink',
        tasks: 13
    }];

    function getAll() {
        return projects;
    }

    return {
        getAll: getAll
    };
});
