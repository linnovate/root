'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($scope, results, term, UsersService,$stateParams) {
	$scope.results = results;

	for (var i = 0; i< $scope.results.length; i++) {
		// if ($scope.results[i].project)
		// 	$scope.results[i].projectObj = $scope.$parent.projects.find(function(e) { 
		// 		return e._id == $scope.results[i].project
		// 	})
		/*if ($scope.results[i].discussions && $scope.results[i].discussions.length)
			$scope.results[i].discussionObj = $scope.$parent.discussions.find(function(e) { 
				return e._id == $scope.results[i].discussions[0]
			})
		if ($scope.results[i].folder)
			$scope.results[i].folderObj = $scope.$parent.folders.find(function(e) { 
				return e._id == $scope.results[i].folder
			})*/
		// if ($scope.results[i].office)
		// 	$scope.results[i].officeObj = $scope.$parent.offices.find(function(e) { 
		// 		return e._id == $scope.results[i].office
		// 	})
	}

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
   

