function bulkOperationsController($scope, context, $stateParams, $state, $i18next, $uibModalInstance, $timeout, activityType, entityName,
                                  MultipleSelectService, UsersService, SettingServices, PermissionsService, NotifyingService) {

    $scope.selectedItems = MultipleSelectService.getSelected();

    $scope.selectedArrays = MultipleSelectService.getSelectedEntityArrays();
    $scope.selectedTypes = Object.keys($scope.selectedArrays).filter( arrayName => $scope.selectedArrays[arrayName].length );

    $scope.selected = {};
    $scope.activityType = activityType;
    $scope.entityName = entityName;
    UsersService.getAll().then(allUsers => {
        $scope.people = allUsers;
        $scope.getUsedWatchers();
    });
    UsersService.getMe().then( me => $scope.me = me);


    $scope.statusMap = SettingServices.getStatusList();
    $scope.statuses = _.intersection(...$scope.selectedTypes.map( type => $scope.statusMap[type] ));

    $scope.select = function (selected) {
        $scope.selected = selected;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.bulkUpdateEvery = (type, value) => {
        let promises = [];

        for(let i = 0; i < $scope.selectedTypes.length; i++){
            let entityName = $scope.selectedTypes[i];
            let entityArray = $scope.selectedArrays[entityName];
            if(!entityArray.length)continue;

            if( type === 'tag'){
                $scope.tagUpdate(entityArray, entityName + 's');
                continue;
            }
            if( type === 'due'){
                if($scope.dateCheck(entityArray, entityName + 's'))continue;
                break;
            }

            promises.push(
                $scope.bulkUpdate(type, value, entityArray, entityName + 's', true)
            )
        }
        Promise.all(promises).then(() => {
            NotifyingService.notify('refreshAfterAllOperations');
        })
    };

    $scope.bulkUpdate = function (type, value, selectedArray = $scope.selectedItems, entityName = $scope.entityName, searchList) {
        if(!value)return;

        let idsArray = selectedArray.map(entity => entity._id);
        let changedBulkObject = {
            update: {},
            ids: idsArray
        };
        changedBulkObject.update[type] = value;

        return MultipleSelectService.bulkUpdate(changedBulkObject, entityName)
            .then(result => {
                for(let i = 0; i < selectedArray.length; i++){
                    let entity = result.find(entity => entity._id === selectedArray[i]._id);
                    if(!entity)continue;

                    if(typeof entity.due === 'string')entity.due = new Date(entity.due);
                    entity = _.pick(entity, [
                      'status', 'watchers', 'assign',
                      'due', 'startDate', 'endDate', 'startTime', 'endTime', 'allDay',
                      'tags', 'recycled']);
                    Object.assign(selectedArray[i], entity);
                }
                if(changedBulkObject.update.delete){
                    refreshState();
                }
                if(!searchList)
                  MultipleSelectService.setSelectedList(selectedArray);
                NotifyingService.notify('refreshAfterOperation');
                return $uibModalInstance.dismiss('cancel');
            });
    };

    $scope.updateComplex = function(){
        let arraysOfTypes = $scope.selectedTypes;
        let updateObject = $scope.selectedWatchers.filter( bulkObject => !bulkObject.remove);

        for (let i = 0; i < arraysOfTypes.length; i++){
            let entityArray = $scope.selectedArrays[arraysOfTypes[i]];
            if(!entityArray.length)continue;

            let updateIds = updateObject.map( bulkObject => bulkObject._id);
            let updatePermissions = updateObject.map( bulkObject => {
                return {
                    'id': bulkObject._id,
                    'level': bulkObject.permissions
                }
            });

            let removeObject = $scope.selectedWatchers.filter( bulkObject => bulkObject.remove);
            let removedIds = removeObject.map( bulkObject => bulkObject._id);

            let idsArray = entityArray.map(entity => entity._id);
            let changedBulkObject = {
                ids: idsArray
            };

            if(updateIds.length){
                changedBulkObject.update = {};
                changedBulkObject.update.watchers = updateIds;
                changedBulkObject.update.permissions = updatePermissions;
            }
            if(removeObject.length){
                changedBulkObject.remove = {};
                changedBulkObject.remove.watchers = removedIds;
            }

            MultipleSelectService.bulkUpdate(changedBulkObject, arraysOfTypes[i] + 's')
                .then(result => {
                    for(let i = 0; i < $scope.selectedItems.length; i++){
                        let entity = result.find(entity => entity._id === $scope.selectedItems[i]._id);
                        if(!entity)continue;

                        if(typeof entity.due === 'string')entity.due = new Date(entity.due);
                        entity = _.pick(entity, ['status', 'watchers', 'permissions', 'assign', 'due', 'tags', 'recycled']);
                        Object.assign($scope.selectedItems[i], entity);
                    }
                    if(changedBulkObject.update.delete){
                        refreshState();
                    }
                    MultipleSelectService.setSelectedList($scope.selectedItems);
                    NotifyingService.notify('refreshAfterOperation');
                    $uibModalInstance.dismiss('cancel');
                });
        }
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
    $scope.selectedWatchers = [];

    $scope.getUsedWatchers = function(){
        let usedIds = getIdsArray($scope.selectedItems[0].watchers);

        for(let selectedItem of $scope.selectedItems){
            usedIds = _.intersection(getIdsArray(selectedItem.watchers), usedIds)
        }

        $scope.usedWatchers = usedIds.map( id => _.find($scope.people, { '_id': id}));
        $scope.getUnusedWatchers();
        $scope.transformToBulkObjects($scope.usedWatchers);
    };

    $scope.getUnusedWatchers = function(){
        let unUsedIds = _.difference(getIdsArray($scope.people), getIdsArray($scope.usedWatchers));
        $scope.unusedWatchers = unUsedIds.map( id =>  _.find($scope.people, { '_id': id}));
    };

    $scope.transformToBulkObjects = function(array){
        $scope.selectedWatchers = array.map( object =>  createBulkWatcher(object._id, $scope.userPermissionStatus(object), false, true));
    };

    function createBulkWatcher(id, perms, remove, primary){
        return {
            '_id': id,
            'permissions': perms,
            'remove': remove,
            'primary': primary
        }
    }

     $scope.getBulkWatchersClass = function(member){
        let bulkObject = $scope.selectedWatchers.find( watcher => watcher._id === member._id);
        return bulkObject.permissions
    };

    function getIdsArray(objArray){
        return objArray.map(obj => obj._id || obj);
    }

    $scope.userPermissionStatus = function(member){
        if(member) return PermissionsService.getUnifiedPerms(member, $scope.selectedItems);
        return 'No Permissions';
    };

    function changePerms(member, newPerms){
        let bulkWatcher = $scope.selectedWatchers.find( watcher => watcher._id === member._id);
        bulkWatcher.permissions = newPerms;
    }

    $scope.setEditor = function(user){return changePerms(user, 'editor')};
    $scope.setCommenter = function(user){return changePerms(user, 'commenter');};
    $scope.setViewer = function(user){return changePerms(user, 'viewer')};

    $scope.addMember = function(member){
        $scope.usedWatchers.push(member);

        let bulkWatcher = createBulkWatcher(member._id,  $scope.userPermissionStatus(member), false, false);
        $scope.selectedWatchers.push(bulkWatcher);
    };

    $scope.removeMember = function(member){
        $scope.usedWatchers = _.reject($scope.usedWatchers,  {'_id': member._id});

        let bulkWatcher = $scope.selectedWatchers.find( watcher => watcher._id === member._id);
        if(bulkWatcher.primary){
            bulkWatcher.remove = true;
        } else {
            $scope.selectedWatchers = _.reject($scope.selectedWatchers,  {'_id': member._id});
        }
    };

    $scope.selfTest = function(member){
        member.selfTest = $scope.me._id === member._id;
        return member;
    };

    $scope.triggerSelect = function() {
        $scope.showSelect = !$scope.showSelect;
        if ($scope.showSelect) {
            $scope.animate = false;
        }
    };

    //------------------------------------------------//
    //----------------------DUE----------------------//

    $scope.selectedDue = {};
    $scope.selectedDiscussionDue = {};
    $scope.setDueDate = 'setDueDate';
    $scope.dueDateErrorMessage = 'couldNotSetPreviousTime';
    $scope.duePlaceholder = $scope.setDueDate;
    $scope.enableSetDueDate = false;

    $scope.dueOptions = {
        onSelect: function() {
            $scope.entityDateCheck();
        },
        dateFormat: 'dd.mm.yy'
    };

    $scope.dateCheck = function(entityArray, entityName){
        let dueDateError = false;

        //just for complex discussions due
        if(entityName === 'discussions' && $scope.enableSetDueDate){
          $scope.bulkUpdate('due', $scope.selectedDiscussionDue, entityArray, entityName);
        }

        // for all other entities due dates
        else if(entityName !== 'discussions' && $scope.entityDateCheck()){
          $scope.bulkUpdate('due', $scope.selectedDue.date, entityArray, entityName);
        }
        else dueDateError = true;

        if(dueDateError){
          $scope.duePlaceholder = $scope.dueDateErrorMessage;
          $scope.selectedDue.date = '';
        }
        return !dueDateError;
    };

    $scope.setDiscussionDue = function(){
      let selectedDue = $scope.selectedDiscussionDue,
        startEndTime = selectedDue.startDate && selectedDue.endDate && selectedDue.startTime && selectedDue.endTime,
        startAllDay = selectedDue.startDate && selectedDue.allDay,
        pastDate = selectedDue.endDate < new Date();

      return $scope.enableSetDueDate = (!!startEndTime || !!startAllDay) && !pastDate;
    };

    $scope.entityDateCheck = function(){
        let nowTime = new Date();
        $scope.enableSetDueDate = !($scope.selectedDue.date < nowTime);

        return $scope.enableSetDueDate;
    };

    $scope.showNormalDueInput = () => {
        return $scope.selectedTypes.some( entityType => {
            return entityType !== 'discussion' && !!$scope.selectedArrays[entityType].length
        })
    };
    $scope.showDiscussionsDueInput = () => !!$scope.selectedArrays['discussion'].length;

  //------------------------------------------------//
  //----------------------TAGS----------------------//

  $scope.usedTags = [];
  $scope.usedTagsFiltered;
  $scope.removedTags = [];
  $scope.tags = [];

  getUsedTags();
  filterUsedTags();

  $scope.getlastInputText = function(val){
    $scope.lastTagInput = val;
  };

  $scope.addLastInputTextToTag = function(query){
    if(query.length && !$scope.usedTags.find( tagObj => tagObj.tag === query)){
        $scope.addTag(query);
    }
  };

  function getUsedTags(){
    let usedTags = $scope.selectedItems[0].tags;

    for(let selectedItem of $scope.selectedItems){
      usedTags = _.intersection(selectedItem.tags, usedTags)
    }

    $scope.usedTags = usedTags.map( tag => tagsToBulkObjects(tag, false, true))
  }

  function filterUsedTags(){
    $scope.usedTagsFiltered = $scope.usedTags.filter( tag => !tag.remove);
  }

  function tagsToBulkObjects(tag, remove, primary){
    return {
      'tag': tag,
      'primary': primary,
      'remove': remove
    }
  }

  $scope.addTagClicked = function () {
    $scope.tagInputVisible = true;
    $timeout(function () {
        let element = angular.element('#addTag .ui-select-toggle')[0];
        element.click();
    }, 0);
  };

  $scope.addTag = function (tag) {
    $scope.usedTags.push(tagsToBulkObjects(tag, false, false));

    $scope.tagInputVisible = false;
    filterUsedTags();
  };

  $scope.removeTag = function (tagObj) {
    let bulkTag = $scope.usedTags.find( obj => obj.tag === tagObj.tag);

    if(bulkTag.primary){
      bulkTag.remove = true;
    } else {
      $scope.usedTags = _.reject($scope.usedTags,  {'tag': tagObj.tag});
    }
    filterUsedTags();
  };

  $scope.tagUpdate = function(entityArray, entityName){

    // add last input text to tags array;
    if($scope.lastTagInput.length){
        $scope.addTag($scope.lastTagInput);
    }

    let updateObject = $scope.usedTags.filter( bulkObject => !bulkObject.remove);

    let updatedTags = updateObject.map( bulkObject => bulkObject.tag);

    let removeObject = $scope.usedTags.filter( bulkObject => bulkObject.remove);
    let removedIds = removeObject.map( bulkObject => bulkObject.tag);

    let idsArray = entityArray.map(entity => entity._id);
    let changedBulkObject = {
      ids: idsArray
    };

    if(updatedTags.length){
      changedBulkObject.update = {};
      changedBulkObject.update.tags = updatedTags;
    }
    if(removeObject.length){
      changedBulkObject.remove = {};
      changedBulkObject.remove.tags = removedIds;
    }

    MultipleSelectService.bulkUpdate(changedBulkObject, entityName)
      .then(result => {
        for(let i = 0; i < $scope.selectedItems.length; i++){
          let entity = result.find(entity => entity._id === $scope.selectedItems[i]._id);
          if(!entity)continue;

          if(typeof entity.due === 'string')entity.due = new Date(entity.due);
          entity = _.pick(entity, ['status', 'watchers', 'assign', 'due', 'tags', 'recycled']);
          Object.assign($scope.selectedItems[i], entity);
        }
        if(changedBulkObject.update && changedBulkObject.update.delete){
          refreshState();
        }
        MultipleSelectService.setSelectedList($scope.selectedItems);
        NotifyingService.notify('refreshAfterOperation');
        $uibModalInstance.dismiss('cancel');
      });
  }

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
