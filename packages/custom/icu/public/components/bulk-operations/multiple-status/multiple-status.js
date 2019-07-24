"use strict";

angular
  .module("mean.icu.ui.bulkoperations")
  .directive("multipleStatus", function() {
    function multipleStatusController(
      $scope,
      MultipleSelectService,
      NotifyingService
    ) {
      $scope.type = "status";
      $scope.tooltipTitle = "bulkStatus";
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
      controller: multipleStatusController,
      templateUrl:
        "/icu/components/bulk-operations/bulk-operations-button.html",
      restrict: "E",
      scope: {
        entityType: "="
      }
    };
  });
