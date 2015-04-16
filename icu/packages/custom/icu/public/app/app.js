'use strict';

angular.module('mean.icu').config([
    '$meanStateProvider',
    '$componentLoaderProvider',
  function($meanStateProvider, $componentLoaderProvider) {
    $componentLoaderProvider.setTemplateMapping(function(name) {
      return 'icu/components/' + name + '/' + name + '.html';
    });

    $meanStateProvider.state('icu example page', {
      url: '/icu',
      templateUrl: 'icu/app/index.html'
    });
  }
]);

angular.module('mean.icu').controller('IcuController', ['$router',
  function($router) {
    $router.config([
        { path: '/icu', component: 'icu' },
    ]);
  }
]);
