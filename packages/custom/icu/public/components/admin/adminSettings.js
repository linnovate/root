"use strict";

angular
  .module("mean.icu.ui.admin", [])
  .controller("adminSettingsController", function($scope, me) {
    $scope.me = me;
  });
