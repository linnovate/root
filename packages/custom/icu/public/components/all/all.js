"use strict";

angular
  .module("mean.icu.ui.all", [])
  .controller("AllController", function($scope, context) {
    $scope.context = context;
  });
