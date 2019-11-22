'use strict';

angular.module('mean.icu.ui.searchlist', [])
.controller('SearchListController', function ($scope, $timeout, $stateParams, results, SearchService) {
	
	document.me = $scope.me.id;
	$scope.results = results;

    $scope.$on('refreshList', function (ev) {
        $timeout(() => {
            SearchService.find($stateParams.query).then(function(res){
                $scope.results = res;
            });
        }, 1500)
    });

    //**********Multiple Select*********//
    $scope.multipleSelectMode = false;

});
