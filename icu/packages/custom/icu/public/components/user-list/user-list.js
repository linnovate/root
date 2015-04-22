'use strict';

angular.module('mean.icu.ui.userlist', [])
.controller('UserListController', function($scope) {
    $scope.people = [{
        name: 'John Doe',
        tasks: 11,
        projects: 2,
        id: 1,
        active: true
    }, {
        name: 'Idan Arbel',
        tasks: 21,
        projects: 4,
        id: 2
    }, {
        name: 'Lior Kessos',
        tasks: 12,
        projects: 3,
        id: 3
    }];
});
