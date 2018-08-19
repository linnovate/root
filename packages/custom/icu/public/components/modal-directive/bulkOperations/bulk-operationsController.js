function bulkOperationsController($scope, context, $stateParams, $state, $i18next, $uibModalInstance, $timeout, activityType, entityName,
                                  MultipleSelectService, UsersService, SettingServices, PermissionsService, NotifyingService) {

    $scope.selectedItems = MultipleSelectService.getSelected();
    $scope.activityType = activityType;
    $scope.entityName = entityName;
    UsersService.getAll().then(allUsers => {
      $scope.people = allUsers;
      $scope.unUsedWatchers = $scope.getUnusedWatchers();
    });

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
                    if(typeof entity.due === 'string')entity.due = new Date(entity.due);
                    entity = _.pick(entity, ['status', 'watchers', 'assign', 'due', 'tags', 'recycled']);
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

    //--------------------------------------------------//
    //----------------------watchers----------------------//

    $scope.usedWatchers = [];
    $scope.unUsedWatchers = [];

    $scope.getUnusedWatchers = function(){
      // return _.differenceBy($scope.people, $scope.usedWatchers, '_id'); // didn't
      let unUsed = [];
      for(let prop in $scope.people){
        if(!_.includes($scope.usedWatchers, $scope.people[prop])){
          unUsed.push($scope.people[prop]);
        }
      }
      return unUsed;
    };

    $scope.addMember = function(member){
      $scope.usedWatchers.push(member);
      $scope.unUsedWatchers = $scope.unUsedWatchers.filter(watcher => watcher._id !== member._id);
    };

    $scope.removeMember = function(member){
      $scope.unUsedWatchers.push(member);
      $scope.usedWatchers = $scope.usedWatchers.filter(watcher => watcher._id !== member._id);
    };

    $scope.triggerSelect = function() {
      $scope.showSelect = !$scope.showSelect;
      if ($scope.showSelect) {
        $scope.animate = false;
      }
    };

    $scope.getWatchersIds = function(watchers){
      return watchers.map(watcher => watcher._id);
    };

    $scope.showDelete = function (user, show) {
      user.showDelete = show;
      console.log(show)
    };

    //------------------------------------------------//
    //----------------------DUE----------------------//

    $scope.selectedDue = {};
    $scope.setDueDate = 'setDueDate';
    $scope.dueDateErrorMessage = 'couldNotSetPreviousTime';
    $scope.duePlaceholder = $scope.setDueDate;

    $scope.dueOptions = {
        dateFormat: 'dd.mm.yy'
    };

    $scope.dateCheck = function(){
        let nowTime = new Date();
        if($scope.selectedDue.date < nowTime){
            $scope.duePlaceholder = $scope.dueDateErrorMessage;
            $scope.selectedDue.date = '';
        } else {
            $scope.bulkUpdate('due', $scope.selectedDue.date);
        }
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
      case 'watchers':
          $scope.title = `${$i18next('setWatchers')}`;
          break;
      case 'assign':
          $scope.title = `${$i18next('assign')}`;
          break;
      case 'due':
          $scope.title = `${$i18next('setDueDate')}`;
          break;
      case 'tag':
          $scope.title = `${$i18next('addTags')}`;
          break;
      case 'delete':
          $scope.title = `${$i18next('delete')}`;
          break;
  }
}
