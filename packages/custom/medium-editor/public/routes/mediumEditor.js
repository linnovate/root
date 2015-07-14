'use strict';

angular.module('mean.medium-editor').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('mediumEditor example page', {
      url: '/mediumEditor/example',
      templateUrl: 'medium-editor/views/index.html'
    });
  }
]);
