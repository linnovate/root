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

function SearchController($scope, $state, $stateParams, context) {
    $scope.$on('$stateChangeSuccess', function ($event, toState) {
        if (toState.name.indexOf('main.search') !== 0) {
            if ($stateParams.query) {
                $scope.term = $stateParams.query;
            } else {
                $scope.term = '';
            }
        }
    });

    $scope.clearSearch = function () {
        $scope.term = '';
        $scope.search();
    };

    $scope.search = function (term) {
        if (term) {
            $state.go('main.search', {query: term});
        } else {
            $state.go('main.search', {query: ''});

            //$state.go('main.' + context.main + '.byentity', {
            //    entity: context.entityName,
            //    entityId: context.entityId
            //});
        }
    };
}

angular.module('mean.icu.ui.search', [])
    .controller('SearchController', SearchController);

function MiddlepaneController() {
}

angular.module('mean.icu.ui.middlepane')
    .controller('MiddlepaneController', MiddlepaneController);
