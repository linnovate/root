'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($scope, results, term, UsersService) {
	$scope.results = results;
	
	$scope.inObjArray = function(id,array){
		array.forEach(function(w){
			if(w._id && w._id==id){
				return true;
			}
		});
		return false;
	};






    UsersService.getMe().then(function(me){
    	var id = me._id;
    	var finalResults = [];
    	for(var i=0;i<results.length;i++){
    		var task = results[i];
    		if(task.creator == id || task.assign == id || $.inArray(id, task.watchers)!=-1 || $scope.inObjArray(id,task.watchers)){
    			finalResults.push(task);
    		}
    	}
    	$scope.term = term;
    	$scope.results = finalResults;
        $scope.length = $scope.results.length;
    	});
    });
   

