"use strict";

angular.module("mean.elasticsearch").config([
  "$stateProvider",
  function($stateProvider) {
    $stateProvider.state("elasticsearch status", {
      url: "/elasticsearch/status",
      templateUrl: "elasticsearch/views/status.html"
    });
  }
]);
