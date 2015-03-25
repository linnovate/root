'use strict';

angular.module('mean.tasks').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('tasks example page', {
      url: '/tasks/example',
      templateUrl: 'tasks/views/index.html'
    });
  }
]);
