'use strict';

angular.module('mean.icu.ui.userdetails', [])
.controller('UserDetailsController', function($scope) {
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
