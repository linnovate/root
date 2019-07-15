'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($scope, $state, results, term, SearchService, UsersService) {
	
	document.me = $scope.me.id;
	
	$scope.results = results;
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

    // On recycleRestore, remove entity from list
    $scope.$on('recycleRestore', (event, id) => {
        let index = $scope.results.findIndex(item => item._id === id);
        $scope.results.splice(index, 1);
        $state.go('^.^');
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
            $scope.resultsLength = $scope.results.length;
        });
    }

    //**********Multiple Select*********//
    $scope.multipleSelectMode = false;

});


