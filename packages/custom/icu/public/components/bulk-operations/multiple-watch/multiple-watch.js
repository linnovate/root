"use strict";

angular
  .module("mean.icu.ui.bulkoperations")
  .directive("multipleWatch", function() {
    function multipleWatchController(
      $scope,
      MultipleSelectService,
      NotifyingService
    ) {
      $scope.type = "watchers";
      $scope.selectedItems = $scope.$parent.selectedItems;

      refreshAccess();

      $scope.$on("refreshBulkButtonsAccess", function(event) {
        refreshAccess();
      });

      function refreshAccess() {
        return ($scope.allowed = MultipleSelectService.haveBulkPerms(
          $scope.type
        ));
      }
    }
    return {
      controller: multipleWatchController,
      templateUrl:
        "/icu/components/bulk-operations/bulk-operations-button.html",
      restrict: "E",
      scope: {
        entityType: "="
      }
    };
  });
