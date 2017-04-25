'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($scope, results, term, UsersService) {
    $scope.results = results;
    UsersService.getMe().then(function(me){
    	var id = me._id;
    	var finalResults = [];
    	for(var i=0;i<results.length;i++){
    		var task = results[i];
    		if(task.creator == id || task.assign == id || $.inArray(id, task.watchers)!=-1){
    			finalResults.push(task);
    		}
    	}
    	$scope.term = term;
    	$scope.results = finalResults;
    	});
    });
   

