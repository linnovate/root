'use strict';

angular.module('mean.projects').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('projects example page', {
      url: '/projects/example',
      templateUrl: 'projects/views/index.html'
    });
  }
]);
