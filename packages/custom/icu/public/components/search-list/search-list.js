'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($scope, results, term) {
    $scope.results = results;
    $scope.term = term;
});
