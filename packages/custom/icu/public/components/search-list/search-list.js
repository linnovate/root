'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($rootScope, $scope, $stateParams, $location, $timeout, results, term, SearchService, UsersService) {
    $scope.results = results.data;
    $scope.resultsLength = results.counts.total;
    $scope.loadNext = results.next;
    $scope.loadPrev = results.prev;

    filterFinalRes();

    $scope.inObjArray = function(id,array){
      array.forEach(function(w){
        if(w._id && w._id === id){
          return true;
        }
      });
      return false;
    };

    $scope.$on('refreshList', function (ev) {
        SearchService.find(term).then(function(res){
            $scope.results = res;
            filterFinalRes();
        });
    });

    function filterFinalRes(){
        UsersService.getMe().then(function(me){
            let id = me._id;
            let finalResults = [];
            for(let i=0; i < $scope.results.length; i++){
                let task = $scope.results[i];
                if(
                    task.creator === id
                    || task.assign === id
                    || $.inArray(id, task.watchers) !== -1
                    || $scope.inObjArray(id,task.watchers)){
                    finalResults.push(task);
                }
            }
            $scope.term = term;
            $scope.results = finalResults;
        });
    }

    //**********Multiple Select*********//
    $scope.multipleSelectMode = false;

});


