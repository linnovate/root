'use strict';

/* jshint -W098 */
angular.module('mean.general').controller('GeneralController', ['$scope', 'Global', 'General', '$router',
  function($scope, Global, General, $router) {
    $router.config([{
      path: '/general/example',
      component: 'general'
    }, {
      path: '/general/example/anyone',
      component: 'anyone'
    }]);

    $scope.global = Global;
    $scope.package = {
      name: 'general'
    };
  }
]);
