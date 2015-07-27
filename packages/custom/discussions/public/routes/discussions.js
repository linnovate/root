'use strict';

angular.module('mean.discussions').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('discussions example page', {
      url: '/discussions/example',
      templateUrl: 'discussions/views/index.html'
    });
  }
]);
