'use strict';

/* jshint -W098 */
angular.module('mean.actions').controller('ActionsController', ['$scope', 'Global', 'Actions',
  function($scope, Global, Actions) {
    $scope.global = Global;
    $scope.package = {
      name: 'actions'
    };
  }
]);
