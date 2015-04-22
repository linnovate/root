'use strict';

angular.module('mean.general').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('general example page', {
      url: '/general/example',
      templateUrl: 'general/views/index.html'
    });
  }
]);
