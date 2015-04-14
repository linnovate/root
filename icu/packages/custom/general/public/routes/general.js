'use strict';

angular.module('mean.general').config(['$stateProvider', '$componentLoaderProvider',
  function($stateProvider, $componentLoaderProvider) {

    $componentLoaderProvider.setTemplateMapping(function(name) {
      return '/general/views/' + name + '.html';
    });

    $stateProvider.state('general example page', {
      url: '/general/example',
      templateUrl: 'general/views/index.html',
    });
  }
]);
