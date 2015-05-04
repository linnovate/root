'use strict';

angular.module('mean.icapi').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('icapi example page', {
      url: '/icapi/example',
      templateUrl: 'icapi/views/index.html'
    });
  }
]);
