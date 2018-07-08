'use strict';

function MultipleSelectController($scope, PermissionsService) {

  var vm = this;

  console.log(vm.selectedItems);
  // $scope.selectedItems;

}

angular.module('mean.icu.ui.bulkoperations', []).controller('MultipleSelectController', MultipleSelectController);
