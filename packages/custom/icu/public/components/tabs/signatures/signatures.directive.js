"use strict";

angular
  .module("mean.icu.ui.tabs")
  .directive("icuTabsSignatures", function(
    $state,
    $filter,
    SignaturesService,
    PermissionsService
  ) {
    function controller($scope) {
      $scope.signature = "";
      $scope.showButton = false;

      $scope.submit = function() {
        $scope.signature["office"] = $state.current.params.id;
        $scope.signature["message"] = "בברכה,";
        SignaturesService.create($scope.signature)
          .then(function(result) {
            $scope.signature = "";
            $scope.signatures.push(result);
          })
          .catch(function(error) {});
      };
      $scope.delete = function(signature) {
        SignaturesService.remove(signature._id)
          .then(function(result) {
            let index = $scope.signatures.findIndex(
              sig => sig._id === signature._id
            );
            if (index != -1) {
              $scope.signatures.splice(index, 1);
            }
          })
          .catch(function(error) {});
      };

      $scope.havePermissions = function(type, enableRecycled) {
        enableRecycled = enableRecycled || !$scope.isRecycled;
        return (
          PermissionsService.havePermissions($scope.entity, type) &&
          enableRecycled
        );
      };
    }

    return {
      restrict: "A",
      scope: {
        signatures: "=",
        entityName: "@",
        entity: "="
      },
      controller: controller,
      replace: true,
      templateUrl: "/icu/components/tabs/signatures/signatures.html"
    };
  });
