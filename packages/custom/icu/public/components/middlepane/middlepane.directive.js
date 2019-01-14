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
    $scope.$on('$stateChangeSuccess', function ($event, toState) {
        if (toState.name.indexOf('main.search') !== 0) {
            if ($stateParams.query && $stateParams.query.length) {
                $scope.term = $stateParams.query;
            } else {
                $scope.term = '';
            }
        }
    });

    $scope.clearSearch = function () {
        $scope.term = '';
        search();
    };

    function search(term) {
        SearchService.builtInSearchArray = false;
        $state.go('main.search', {query: term});
    }

    function refreshQuery(term){
        SearchService.refreshQuery(term);
    }

    $scope.builtInSearch = function(funcName) {
      $document.on("click", onDocumentClick);
    	TasksService[funcName]().then(function(res){
    		SearchService.builtInSearchArray = res;
    		$state.go('main.search', {query: ''}, {reload: true});
    	});
    };

    function activeSearchNav(){
        NotifyingService.notify('activeSearch');
    }

    $scope.startSearch = function(term){
        search(term);
        activeSearchNav();
        refreshQuery(term);
    };
}

angular.module('mean.icu.ui.search', [])
    .controller('SearchController', SearchController);

function MiddlepaneController() {
}

angular.module('mean.icu.ui.middlepane')
    .controller('MiddlepaneController', MiddlepaneController);
