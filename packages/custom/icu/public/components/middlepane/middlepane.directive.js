'use strict';

angular.module('mean.icu.ui.middlepane', [])
.directive('icuMiddlepane', function () {
    function controller() {
    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/middlepane/middlepane.html'
    };
});

function SearchController($scope, $state, $stateParams, context, NotifyingService, TasksService, $timeout, SearchService, $document, $location) {
    $scope.term = $stateParams.query;

    $scope.clearSearch = function () {
        $scope.term = '';
        $scope.search();
    };

    $scope.builtInSearch = function(funcName) {
        $document.on("click", onDocumentClick);
    	TasksService[funcName]().then(function(res){
    		SearchService.builtInSearchArray = res;
    		$state.go('main.search', {query: ''}, {reload: true});
    	});
    };

    $scope.search = function() {
        SearchService.builtInSearchArray = false;
        $state.go('main.search', {
            query: $scope.term
        }, {
            reload: true
        }).then(() => {
            NotifyingService.notify('activeSearch');
            SearchService.refreshQuery($scope.term);
        });
    };
}

angular.module('mean.icu.ui.search', [])
    .controller('SearchController', SearchController);

function MiddlepaneController() {
}

angular.module('mean.icu.ui.middlepane')
    .controller('MiddlepaneController', MiddlepaneController);
