function bulkOperationsController($scope, context, $stateParams, $state, $i18next, $uibModalInstance, $timeout, activityType, entityName,
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
                if(changedBulkObject.update.delete){
                    refreshState();
                }
                MultipleSelectService.setSelectedList($scope.selectedItems);
                NotifyingService.notify('refreshAfterOperation');
                $uibModalInstance.dismiss('cancel');
            });
    };

    function refreshState(){
        let currentState = $state.current.name;
        $state.go(currentState, {
            entity: 'all',
        }, {
            reload: true
        });
    }

    //------------------------------------------------//
    //----------------------DUE----------------------//

    $scope.dueOptions = {
        dateFormat: 'dd.mm.yy'
    };

  //------------------------------------------------//
  //----------------------TAGS----------------------//

  $scope.tags = [];
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
          $scope.title = `${$i18next('setStatus')}`;
          break;
      case 'watch':
          $scope.title = `${$i18next('setWatchers')}`;
          break;
      case 'assign':
          $scope.title = `${$i18next('assignTo')}`;
          break;
      case 'due':
          $scope.title = `${$i18next('setDueDate')}`;
          break;
      case 'tag':
          $scope.title = `${$i18next('addTags')}`;
          break;
      case 'delete':
          $scope.title = `${$i18next('Delete')} ${$scope.selectedItems.length} ${entityName}`;
          break;
  }
}
