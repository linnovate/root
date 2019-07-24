"use strict";

angular
  .module("mean.icu.data.warningsservice", [])
  .service("WarningsService", function($rootScope) {
    $rootScope.warnings = {};

    function setWarning(warning) {
      if (warning) {
        warning = JSON.parse(warning);
        Object.keys(warning)[0] = Object.keys(warning)[0].replace(/ /g, "");
        $rootScope.warnings[Object.keys(warning)[0]] =
          warning[Object.keys(warning)[0]];

        if (
          warning[Object.keys(warning)[0]].indexOf("connect ECONNREFUSED") >= 0
        ) {
          $rootScope.warnings[Object.keys(warning)[0]] = "connectECONNREFUSED";
        }
      }
    }

    return {
      setWarning: setWarning
    };
  });
