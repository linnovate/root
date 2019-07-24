"use strict";

angular
  .module("mean.icu.ui.userlist", [])
  .controller("UserListController", function($scope, users, $state, context) {
    $scope.people = users;

    if ($scope.people.length && $state.current.name === "main.people") {
      $state.go("main.people.byentity.details", {
        id: $scope.people[0]._id,
        entity: context.entityName,
        entityId: context.entityId
      });
    }
  });
