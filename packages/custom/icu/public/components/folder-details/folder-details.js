'use strict';

angular.module('mean.icu.ui.folderdetails', []).controller('FolderDetailsController', FolderDetailsController);

function FolderDetailsController($rootScope, $scope, entity, me, tasks, people, folders, offices, $timeout, context, $state, FoldersService, PermissionsService, $stateParams, OfficesService, ActivitiesService, EntityService, DetailsPaneService) {

  // ==================================================== init ==================================================== //

  $scope.tabs = DetailsPaneService.orderTabs(['activities', 'documents', 'officeDocuments']);

  let currentState = $state.current.name;

  if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("folders"))) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }

  if (!$scope.item) {
    $state.go('main.folders.byentity', {
      entity: context.entityName,
      entityId: context.entityId
    });
  }

  $scope.options = {
    theme: 'bootstrap',
    buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
  };
  $scope.statuses = ['new', 'in-progress', 'canceled', 'done', 'archived'];

  $scope.entity = entity || context.entity;
  $scope.tasks = tasks.data || tasks;
  $scope.items = folders.data || folders;
  $scope.offices = offices.data || offices;

  // backup for previous changes - for updates
  var backupEntity = JSON.parse(JSON.stringify($scope.item));

  $scope.people = people.data || people;

  $scope.updateCurrentFolder = function(){
    FoldersService.currentFolderName = $scope.item.title;
  }

  FoldersService.getTags().then(result =>
    $scope.tags = result
  );

  FoldersService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  // ==================================================== onChanges ==================================================== //

  function navigateToDetails(folder) {
    $scope.detailsState = context.entityName === 'all' ? 'main.folders.all.details' : 'main.folders.byentity.details';

    $state.go($scope.detailsState, {
      id: folder._id,
      entity: context.entityName,
      entityId: context.entityId,
      starred: $stateParams.starred
    }, {
      reload: true
    });
  }

  $scope.onStar = function(value) {

    $scope.update($scope.item, {
      name: 'star'
    });

    FoldersService.star($scope.item).then(function () {
      navigateToDetails($scope.item);
      // "$scope.item.star" will be change in 'ProjectsService.star' function
    });
  }

  $scope.onStatus = function(value) {
    $scope.item.status = value;
    $scope.update($scope.item, {
      name: 'status'
    })
  }

  $scope.onColor = function(value) {
    $scope.update($scope.item, value);
  }

  $scope.onWantToCreateRoom = function() {
    $scope.item.WantRoom = true;

    $scope.update($scope.item, context);

    FoldersService.WantToCreateRoom($scope.item).then(function(data) {
      navigateToDetails($scope.item);
      if(data.roomName) {
        $window.open(window.config.rocketChat.uri + '/group/' + data.roomName);
        return true;
      }
      else {
        return false;
      }
    });
};

  $scope.onTags = function(value) {
    $scope.item.tags = value;
    $scope.update($scope.item,context);
  }

  // ==================================================== Menu events ==================================================== //

    $scope.recycle = function() {
        EntityService.recycle('folders', $scope.item._id).then(function() {
            let clonedEntity = JSON.parse(JSON.stringify($scope.item));
            clonedEntity.status = "Recycled"
            // just for activity status
            FoldersService.updateStatus(clonedEntity, $scope.item).then(function(result) {
                ActivitiesService.data.push(result);
            });

            refreshList();
            if (currentState.indexOf('search') != -1) {
                $state.go(currentState, {
                    entity: context.entityName,
                    entityId: context.entityId
                }, {
                    reload: true,
                    query: $stateParams.query
                });
            } else {
                $state.go('main.folders.all', {
                    entity: 'all'
                }, {
                    reload: true
                });
            }
        });
    }

    $scope.recycleRestore = function() {
        EntityService.recycleRestore('folders', $scope.item._id).then(function() {
            let clonedEntity = JSON.parse(JSON.stringify($scope.item));
            clonedEntity.status = "un-deleted";
            // just for activity status
            FoldersService.updateStatus(clonedEntity, $scope.item).then(function(result) {
                ActivitiesService.data.push(result);
            });

            refreshList();

            var state = currentState.indexOf('search') !== -1 ? $state.current.name : 'main.folders.all';
            $state.go(state, {
                entity: context.entityName,
                entityId: context.entityId
            }, {
                reload: true
            });
        });
    }

    function refreshList() {
        $rootScope.$broadcast('refreshList');
    }

  $scope.menuItems = [{
    label: 'deleteFolder',
    fa: 'fa-times-circle',
    display: !$scope.item.hasOwnProperty('recycled'),
    action: $scope.recycle,
  },{
    label: 'Say Hi!',
    icon: 'chat',
    display: true,
    action: $scope.onWantToCreateRoom
  },{
    label: 'unrecycleFolder',
    fa: 'fa-times-circle',
    display: $scope.item.hasOwnProperty('recycled'),
    action: $scope.recycleRestore,
  }];

  // ==================================================== Category ==================================================== //

  function removeDuplicates(objArr, prop) {
    return objArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  $scope.onCategory = function(value) {

    if (value) {
      $scope.item.office = value;
      $scope.item.watchers = $scope.item.watchers.concat($scope.item.office.watchers);
      $scope.item.watchers = removeDuplicates($scope.item.watchers, '_id')
    } else {
      $scope.item.office = {}
    }

    FoldersService.update($scope.item).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
      let officeId = result.office ? result.office._id : undefined;
      $state.go('main.folders.byentity.details', {
        entity: context.entityName,
        entityId: officeId,
        id: $scope.item._id
      }, {
        reload: true
      });
    });
  };

  $scope.newCategory = function(value) {
    var office = {
      color: '0097A7',
      title: value,
      watchers: [],
   };
    return OfficesService.create(office).then(function(result) {
      $scope.offices.push(result);
      return result;
    });
  }

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal) {
      var context = {
        name: 'title',
        oldVal: oVal,
        newVal: nVal,
        action: 'renamed'
      };
      $scope.delayedUpdate($scope.item, context);
      FoldersService.currentFolderName = $scope.item.title;
    }
  });

  var nText, oText;
  $scope.$watch('item.description', function(nVal, oVal) {
    nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    if (nText != oText) {
      var context = {
        name: 'description',
        oldVal: oVal,
        newVal: nVal,
      };
      $scope.delayedUpdate($scope.item, context);
    }
  });

  // ==================================================== Update ==================================================== //

  $scope.update = function(folder, context) {
    if (context.name === 'color') {
      folder.color = context.newVal;
    }
    FoldersService.update(folder, context).then(function(res) {
      if (FoldersService.selected && res._id === FoldersService.selected._id) {
        if (context.name === 'title') {
          FoldersService.selected.title = res.title;
        }
      }
      switch (context.name) {
      case 'status':
        FoldersService.updateStatus(folder, me, backupEntity).then(function(result) {
          backupEntity = JSON.parse(JSON.stringify($scope.item));
          ActivitiesService.data = ActivitiesService.data || [];
          ActivitiesService.data.push(result);
          refreshList();
        });
        break;

      case 'star':
        FoldersService.updateStar(folder, me, backupEntity).then(function(result) {
          backupEntity = JSON.parse(JSON.stringify($scope.item));
          ActivitiesService.data = ActivitiesService.data || [];
          ActivitiesService.data.push(result);
        });
        break;
      case 'title':
          FoldersService.updateTitle(folder, me, backupEntity).then(function(result) {
              backupEntity = JSON.parse(JSON.stringify($scope.item));
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
          });
          break;
      case 'description':
        FoldersService.updateDescription(folder, me, backupEntity).then(function(result) {
          backupEntity = JSON.parse(JSON.stringify($scope.item));
          ActivitiesService.data = ActivitiesService.data || [];
          ActivitiesService.data.push(result);
        });
        break;
      }
    });
  }

  $scope.delayedUpdate = _.debounce($scope.update, 2000);

  // ==================================================== havePermissions ==================================================== //

  $scope.enableRecycled = true;
  $scope.havePermissions = function(type, enableRecycled) {
    if (entity) {
      enableRecycled = enableRecycled || !$scope.isRecycled;
      return (PermissionsService.havePermissions(entity, type) && enableRecycled);
    }
  }

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.entity);
  }

  $scope.permsToSee = function() {
    return PermissionsService.haveAnyPerms($scope.entity);
  }

}
