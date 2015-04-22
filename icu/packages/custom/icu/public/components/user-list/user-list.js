'use strict';

angular.module('mean.icu.ui.userlist', [])
.controller('UserListController', function($scope) {
    $scope.people = [{
        name: 'John Doe',
        id: 1
    }, {
        name: 'Idan Arbel',
        id: 2
    }, {
        name: 'Lior Kessos',
        id: 3
    }];
});
