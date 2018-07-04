'use strict';

angular.module('mean.icu.ui.folderdetails', []).controller('FolderDetailsController', FolderDetailsController);

function FolderDetailsController($scope, entity, tasks, people, folders, offices, $timeout, context, $state, BoldedService, FoldersService, PermissionsService, $stateParams, OfficesService, ActivitiesService) {

  // ==================================================== init ==================================================== //

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
  $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

  $scope.entity = entity || context.entity;
  $scope.tasks = tasks.data || tasks;
  $scope.items = folders.data || folders;
  $scope.offices = offices.data || offices;
  $scope.item.tags = tags;

  // backup for previous changes - for updates
  var backupEntity = JSON.parse(JSON.stringify($scope.item));

  $scope.people = people.data || people;

  $scope.updateCurrentFolder = function(){
    $scope.folder.PartTitle = $scope.folder.title;
    FoldersService.currentFolderName = $scope.folder.title;
  }

  FoldersService.getTags().then(result =>
    $scope.tags = result
  );

  FoldersService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  boldedUpdate($scope.item, 'viewed').then(updatedItem => {
    $scope.item.bolded = updatedItem.bolded;
  });

  function boldedUpdate(entity, action) {
    let entityType = 'folders';
    return BoldedService.boldedUpdate(entity, entityType, action)
  }

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
    FoldersService.star($scope.item).then(function() {
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
    if ($scope.item.WantRoom == false) {
      $scope.item.WantRoom = true;

      $scope.update($scope.item, context);

      FoldersService.WantToCreateRoom($scope.item).then(function() {
        navigateToDetails($scope.item);
      });
    }
  }

  $scope.onTags = function(value) {
    $scope.item.tags = value;
    $scope.update($scope.item,context);
  }

  // ==================================================== Menu events ==================================================== //

  $scope.deleteFolder = function(folder) {
    FoldersService.remove($scope.item._id).then(function() {

      $state.go('main.folders.all', {
        entity: 'all'
      }, {
        reload: true
      });
    });
  }

  $scope.menuItems = [{
    label: 'deleteFolder',
    icon: 'times-circle',
    display: !$scope.item.hasOwnProperty('recycled'),
    action: $scope.deleteFolder,
  }];

  // ==================================================== Category ==================================================== //

  $scope.onCategory = function(value) {
    if (!value) {
      delete  $scope.item.office;
      $scope.update($scope.item);
      return;
    }

    $scope.item.office = value;

    $scope.item.watchers = $scope.item.watchers.concat($scope.item.office.watchers);
    $scope.item.watchers = _.map(_.groupBy($scope.item.watchers, function(doc) {
      return doc._id;
    }), function(grouped) {
      return grouped[0];
    });

    FoldersService.update($scope.item).then(function(result) {
      FoldersService.updateEntity($scope.item, backupEntity).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      //if (context.entityName === 'office') {
      var officeId = result.office ? result.office._id : undefined;
      if (!officeId) {
        $state.go('main.folders.all.details', {
          entity: 'folder',
          id: $scope.item._id
        }, {
          reload: true
        });
      } else {
        if (officeId !== context.entityId || type === 'office') {
          $state.go('main.folders.byentity.details', {
            entity: context.entityName,
            entityId: officeId,
            id: $scope.item._id
          }, {
            reload: true
          });
        }
      }
    });
  }

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
    if (nText != oText && oText) {
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
        FoldersService.updateStatus(folder, backupEntity).then(function(result) {
          backupEntity = JSON.parse(JSON.stringify($scope.item));
          ActivitiesService.data = ActivitiesService.data || [];
          ActivitiesService.data.push(result);
        });
        break;

      case 'color':
        FoldersService.updateColor(folder).then(function(result) {
          ActivitiesService.data = ActivitiesService.data || [];
          ActivitiesService.data.push(result);
        });
        break;
      case 'title':
      case 'description':
        FoldersService.updateTitle(folder, backupEntity, context.name).then(function(result) {
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
