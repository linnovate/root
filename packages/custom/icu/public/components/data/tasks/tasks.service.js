'use strict';

angular.module('mean.icu.data.tasksservice', [])
.service('TasksService', function() {
    var tasks = [{
        id: 1,
        name: 'Design of application UI',
        project: 1,
        status: 'Pending',
        due: new Date(2015, 4, 15)
    }, {
        id: 2,
        name: 'Design of application UI',
        project: 2,
        status: 'Completed',
        due: new Date(2015, 4, 9)
    }, {
        id: 3,
        name: 'Design of application UI',
        project: 3,
        status: 'Completed',
        due: new Date(2015, 4, 1)
    }];

    function getAll() {
        return tasks;
    }

    return {
        getAll: getAll
    };
});
