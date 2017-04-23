'use strict';

/* jshint -W098 */
angular.module('mean.medium-editor').controller('MediumEditorController', ['$scope', 'Global', 'MediumEditor',
  function($scope, Global, MediumEditor) {
    $scope.global = Global;
    $scope.package = {
      name: 'medium-editor'
    };
  }
]);
