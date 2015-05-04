'use strict';

angular.module('mean.actions').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('actions example page', {
      url: '/actions/example',
      templateUrl: 'actions/views/index.html'
    });
  }
]);
