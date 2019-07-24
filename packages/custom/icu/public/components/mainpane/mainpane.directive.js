"use strict";

angular.module("mean.icu.ui.mainpane", []).directive("icuMainpane", function() {
  function controller() {}

  return {
    restrict: "A",
    controller: controller,
    templateUrl: "/icu/components/mainpane/mainpane.html",
    link: function() {}
  };
});
