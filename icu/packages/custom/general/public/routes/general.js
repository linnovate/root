'use strict';

angular.module('mean.general').config(['$stateProvider', '$componentLoaderProvider',
  function($stateProvider, $componentLoaderProvider) {
    $stateProvider.state('general example page', {
      url: '/general/example',
      templateUrl: 'general/views/index.html',
    });
  }
]);
