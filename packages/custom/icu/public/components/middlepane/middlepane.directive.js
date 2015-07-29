'use strict';

angular.module('mean.icu.ui.middlepane', [])
.directive('icuMiddlepane', function() {
  function controller() {
  }

  return {
    restrict: 'A',
    controller: controller,
    templateUrl: '/icu/components/middlepane/middlepane.html'
  };
});

function SearchController($scope, $state, $stateParams) {
    if ($stateParams.query) {
        $scope.term = $stateParams.query;
    }

    function search(term) {
        if (term) {
            $state.go('main.search', { query: term });
        }
    }

    $scope.search = _.debounce(search, 300);
}

angular.module('mean.icu.ui.search', [])
.controller('SearchController', SearchController);

function MiddlepaneController() {
}

angular.module('mean.icu.ui.middlepane')
.controller('MiddlepaneController', MiddlepaneController);
