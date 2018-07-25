function bulkOperationsController($scope, $i18next, $uibModalInstance, $timeout, activityType, entityName,
                                  MultipleSelectService, UsersService, SettingServices, PermissionsService, NotifyingService) {

    $scope.selectedItems = MultipleSelectService.getSelected();
    $scope.activityType = activityType;
    $scope.entityName = entityName;
    UsersService.getAll().then(allUsers => $scope.people = allUsers);


    $scope.statusMap = SettingServices.getStatusList();
    $scope.statuses = $scope.statusMap[$scope.entityName.substring(0, $scope.entityName.length - 1)];

    $scope.select = function (selected) {
        $scope.selected = selected;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.bulkUpdate = function (type, value) {
        if(!value)return;

        let idsArray = $scope.selectedItems.map(entity => entity._id);
        let changedBulkObject = {
            update: {},
            ids: idsArray
        };
        changedBulkObject.update[type] = value;

        MultipleSelectService.bulkUpdate(changedBulkObject, $scope.entityName)
            .then(result => {
                for(let i = 0; i < $scope.selectedItems.length; i++){
                    let entity = result.find(entity => entity._id === $scope.selectedItems[i]._id);
                    Object.assign($scope.selectedItems[i], entity);
                }
                if(changedBulkObject.update.delete)NotifyingService.notify('clearSelectedList');
                MultipleSelectService.setSelectedList($scope.selectedItems);
                NotifyingService.notify('refreshAfterOperation');
                $uibModalInstance.dismiss('cancel');
            });
    };

    //------------------------------------------------//
    //----------------------DUE----------------------//

    $scope.dueOptions = {
        dateFormat: 'dd.mm.yy'
    };

  //------------------------------------------------//
  //----------------------TAGS----------------------//

  $scope.addTagClicked = function () {
      $scope.tagInputVisible = true;
      $timeout(function () {
          let element = angular.element('#addTag .ui-select-toggle')[0];
          element.click();
      }, 0);
  };

    $scope.addTag = function (tag) {
      if (!$scope.selected) $scope.selected = [];

      if (!$scope.selected.find(selectedTag => selectedTag === tag)) {
          $scope.selected.push(tag);
      }
      $scope.tagInputVisible = false;
  };

  $scope.removeTag = function (tag) {
      $scope.selected = _($scope.selected).without(tag);
  };

  $scope.onOpenClose = function (isOpen) {
      $scope.tagInputVisible = !isOpen;
  };

  switch (activityType) {
      case 'status':
          $scope.title = 'Set Status';
          break;
      case 'watch':
          $scope.title = 'Set Watchers';
          break;
      case 'assign':
          $scope.title = 'Assign to';
          break;
      case 'due':
          $scope.title = 'Set Due Date';
          break;
      case 'tag':
          $scope.title = 'Add tags';
          break;
      case 'delete':
          $scope.title = `${$i18next('Delete')} ${selectedItems.length} ${entityName}`;
          break;
  }
}
