'use strict';

/* jshint -W098 */
angular.module('mean.discussions').controller('DiscussionsController', ['$scope', 'Global', 'Discussions',
  function($scope, Global, Discussions) {
    $scope.global = Global;
    $scope.package = {
      name: 'discussions'
    };
  }
]);
