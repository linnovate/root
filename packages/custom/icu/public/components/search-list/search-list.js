'use strict';

angular.module('mean.icu.ui.searchlist', [])
.controller('SearchListController', function ($rootScope, $scope, $stateParams, $location, $timeout, results, term, SearchService, UsersService) {
	
	document.me = $scope.me.id;
	
	$scope.results = results;
    filterFinalRes();

    $scope.$on('refreshList', function (ev) {
        $timeout(() => {
            SearchService.find(term).then(function(res){
                $scope.results = res;
                filterFinalRes();
            });
        }, 1500)
    });

    function filterFinalRes(){
        UsersService.getMe().then(function(me){
            $scope.term = term;
            $scope.resultsLength = $scope.results.length;
        });
    }

    //**********Multiple Select*********//
    $scope.multipleSelectMode = false;

});
