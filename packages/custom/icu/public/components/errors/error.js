"use strict";

angular
  .module("mean.icu.ui.errors", [])
  .controller("ErrorsController", function($scope) {
    $scope.goBack = function() {
      window.history.go(-2);
    };
  });
