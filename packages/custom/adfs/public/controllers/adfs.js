"use strict";

angular.module("mean.adfs").controller("AdfsController", [
  "$scope",
  "$stateParams",
  "$location",
  "Global",
  function($scope, $stateParams, $location, Global) {
    $scope.global = Global;
  }
]);
