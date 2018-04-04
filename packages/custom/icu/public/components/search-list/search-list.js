'use strict';

angular.module('mean.icu.ui.searchlist')
.controller('SearchListController', function ($rootScope, $scope, $stateParams, $location, results, term, SearchService, UsersService) {
	$scope.results = results;
	for (let i = 0; i< $scope.results.length; i++) {
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
    finalRes($scope);

	$scope.inObjArray = function(id,array){
		array.forEach(function(w){
			if(w._id && w._id === id){
				return true;
			}
		});
		return false;
	};

    $scope.$on('refreshList', function (ev) {
        if ($stateParams.recycled == true) {
            $location.search('recycled', 'true');
        }
        if ($stateParams.query && $stateParams.query.length) {
            $scope.results = SearchService.find($stateParams.query);
        } else {
            if (SearchService.builtInSearchArray) {
                var data = SearchService.builtInSearchArray.map(function (d) {
                    d._type = 'task';
                    return d;
                });
                $scope.results = data;
            } else {
                $scope.results = {};
            }
        }
        finalRes($scope);
    });

    function finalRes($scope){
        UsersService.getMe().then(function(me){
            let id = me._id;
            let finalResults = [];
            for(let i=0;i<results.length;i++){
                let task = results[i];
                if(task.creator === id || task.assign === id || $.inArray(id, task.watchers)!==-1 || $scope.inObjArray(id,task.watchers)){
                    finalResults.push(task);
                }
            }
            $scope.term = term;
            $scope.results = finalResults;
            $scope.length = $scope.results.length;
        });
    }

    });


