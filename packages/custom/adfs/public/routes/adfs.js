"use strict";

//Setting up route
console.log("routing client adfs model loading");
angular.module("mean.adfs").config([
  "$stateProvider",
  function($stateProvider) {
    // Check if the user is connected

    console.log("routing client side for mean.adfs");

    $stateProvider.state("transfer", {
      url: "/transfer",
      templateUrl: "/adfs/views/transfer.html",
      controller: "transfer"
    });
  }
]);
