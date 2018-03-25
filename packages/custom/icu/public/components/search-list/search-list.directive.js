'use strict';

angular.module('mean.icu.ui.searchlist', [])
.directive('icuSearchList', function (LayoutService) {
    function controller($scope, $state, SearchService) {

        SearchService.builtInSearchArray = false;

        if ($scope.results.length && $state.current.name === 'main.search') {
            var active  = $scope.results[0];

           // $state.go('.' + active._type, { id: active._id } );
        }
        $scope.rowClicked = function() {
            LayoutService.clicked();
        }
        for(var i = 0;i<$scope.results.length;i++){
            $scope.results[i].id = $scope.results[i].id ? $scope.results[i].id:$scope.results[i]._id;
        }
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/search-list/search-list.directive.html',
        scope: {
            results: '='
        },
        controller: controller
    };
});
