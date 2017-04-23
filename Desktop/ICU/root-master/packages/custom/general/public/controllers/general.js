'use strict';

/* jshint -W098 */
angular.module('mean.general').controller('GeneralController', ['$scope', 'Global', 'General',
  function ($scope, Global, General) {
    $scope.global = Global;
    $scope.package = {
      name: 'general'
    };
  }
]);
