function bulkOperationsController($scope, context, $stateParams, $state, $i18next, $uibModalInstance, $timeout, activityType, entityName,
                                  MultipleSelectService, UsersService, SettingServices, PermissionsService, NotifyingService) {

    $scope.selectedItems = MultipleSelectService.getSelected();
    $scope.selected = [];
    $scope.remove = [];
    $scope.activityType = activityType;
    $scope.entityName = entityName;
    UsersService.getAll().then(allUsers => {
      $scope.people = allUsers;
      $scope.usedWatchers = $scope.getUsedWatchers();
    });
    UsersService.getMe().then( me => $scope.me = me);


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

    $scope.updateComplex = function(){

        let idsArray = $scope.selectedItems.map(entity => entity._id);
        let changedBulkObject = {
            update: {},
            ids: idsArray
        };
        if(Object.keys($scope.selected).length)changedBulkObject.update = $scope.selected;
        if($scope.remove.length)changedBulkObject.remove = $scope.remove;

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
    $scope.unusedWatchers = [];

    $scope.getUsedWatchers = function(){
        let used = $scope.people;
        let selectedLength = $scope.selectedItems.length;

        for(let i = 0; i < selectedLength; i++){
          used = used.filter( watcher => _.includes(getIdsArray($scope.selectedItems[i].watchers), watcher._id) )
        }

        setSelected(used);
        refreshUnusedWatchers(used);
        return used;
    };

    function setSelected(used){
        let selected = $scope.selected;
        selected.watchers = [];
        selected.permissions = [];

        return used.forEach( watcher => {
            selected.watchers.push(watcher._id);
        })
    }

    function refreshUnusedWatchers(used){
        let unusedWatchers = $scope.unusedWatchers = [];
        let unUsedIds = _.difference(getIdsArray($scope.people), getIdsArray(used));
        let unUsedIdsLength = unUsedIds.length;

        for(let i = 0; i < unUsedIdsLength; i++){
            unusedWatchers.push($scope.people.find( watcher => watcher._id === unUsedIds[i]))
        }
        return unusedWatchers;
    }

    function getIdsArray(objArray){
        return objArray.map(obj => obj._id);
    }

    $scope.triggerSelect = function() {
        $scope.showSelect = !$scope.showSelect;
        if ($scope.showSelect) {
            $scope.animate = false;
        }
    };

    $scope.getWatchersIds = function(watchers){
        return watchers.map(watcher => watcher._id);
    };

    $scope.selfTest = function(member){
        member.selfTest = $scope.me._id === member._id;
        return member;
    };

    $scope.userPermissionStatus = function(member){
        if(member) return PermissionsService.getUnifiedPerms(member, $scope.selectedItems);
        return 'No Permissions';
    };

    function changePerms(member, newPerms){
        $scope.updateSelectedWatchers('addUpdate', member, newPerms);
    }

    $scope.setEditor = function(user){return changePerms(user, 'editor')};
    $scope.setCommenter = function(user){return changePerms(user, 'commenter');};
    $scope.setViewer = function(user){return changePerms(user, 'viewer')};

    $scope.addMember = function(member){
        $scope.usedWatchers.push(member);
        $scope.updateSelectedWatchers('addUpdate', member);
    };

    $scope.removeMember = function(member){
        $scope.usedWatchers = $scope.usedWatchers.filter(watcher => watcher._id !== member._id);
        $scope.updateSelectedWatchers('remove', member);
    };

    $scope.updateSelectedWatchers = function(action, watcher, value){
        eraseLastChange(watcher);
        $scope.selected.watchers.push(watcher._id);
        switch(action){
            case 'addUpdate':
                $scope.selected.permissions.push(
                    {
                        id: watcher._id,
                        level: value || 'viewer'
                    });
                changePermsToEntities(watcher, value);
                break;
            case 'remove':
                $scope.remove.push(watcher._id);
                changePermsToEntities(watcher);
                break;
        }

        function changePermsToEntities(watcher, value){
            let selectedItemsLength = $scope.selectedItems.length;
            for(let i = 0; i < selectedItemsLength; i++){
                $scope.selectedItems[i].permissions.push({
                    id: watcher._id,
                    level: value || 'viewer'
                });
            }
        }

        function eraseLastChange(newWatcherOperation){
            findAndRemoveField($scope.selected, 'watchers', newWatcherOperation, true);
            findAndRemoveField($scope.selected, 'permissions', newWatcherOperation, false);
            findAndRemoveField($scope.remove, 'watchers', newWatcherOperation, true);
        }
        function findAndRemoveField(updateObject, field, newWatcherOperation, id){
            if(!updateObject.length)return;
            newWatcherOperation = id ? newWatcherOperation._id : newWatcherOperation;
            let updateParameter = updateObject[field];
            let updateLength = updateParameter.length;

            for(let i = 0; i < updateLength; i++){
                if(updateParameter[i] === newWatcherOperation){
                    delete updateParameter[i];
                    break;
                }
            }
        }
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
