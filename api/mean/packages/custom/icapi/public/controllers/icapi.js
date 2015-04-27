'use strict';

/* jshint -W098 */
angular.module('mean.icapi').controller('IcapiController', ['$scope', 'Global', 'Icapi',
  function($scope, Global, Icapi) {
    $scope.global = Global;
    $scope.package = {
      name: 'icapi'
    };
  }
]);
