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
