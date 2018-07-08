'use strict';

angular.module('mean.icu.ui.bulkoperations', [])
  .component('multipleSelect', {
    controller: function MultipleSelectController($rootScope, $scope) {
      $scope;
      console.log()
    },
    templateUrl: '/icu/components/bulk-operations/bulk-operations.html',
    container: '^^mean.icu.ui.entityList'
  });
