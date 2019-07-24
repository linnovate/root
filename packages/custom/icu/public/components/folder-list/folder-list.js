"use strict";

function FolderListController(
  $scope,
  $state,
  folders,
  NotifyingService,
  BoldedService,
  FoldersService,
  context,
  $stateParams,
  OfficesService,
  MultipleSelectService
) {
  $scope.items = folders.data || folders;

  $scope.entityName = "folders";
  $scope.entityRowTpl = "/icu/components/folder-list/folder-row.html";

  $scope.loadNext = folders.next;
  $scope.loadPrev = folders.prev;

  var creatingStatuses = {
    NotCreated: 0,
    Creating: 1,
    Created: 2
  };

  $scope.update = function(item) {
    return FoldersService.update(item);
  };

  $scope.getBoldedClass = function(entity) {
    return BoldedService.getBoldedClass(entity, "folders");
  };

  $scope.create = function(parent) {
    var newItem = {
      title: "",
      color: "0097A7",
      watchers: [],
      __state: creatingStatuses.NotCreated,
      __autocomplete: true
    };
    if (parent) {
      newItem.office = parent.id;
    }
    return FoldersService.create(newItem)
      .then(function(result) {
        $scope.items.push(result);
        $scope.folders.push(result);
        FoldersService.data.push(result);
        return result;
      })
      .then(item => {
        let updated = false;
        if (parent && parent.type === "office") {
          return OfficesService.getById(context.entityId)
            .then(parentEntity => {
              let parentParams = _.pick(parentEntity, [
                "watchers",
                "permissions"
              ]);
              Object.assign(item, parentParams);
              updated = !updated;
              return { item, updated };
            })
            .then(res => {
              if (res.updated) FoldersService.update(res.item);
              return res.item;
            });
        }
        return item;
      });
  };
}

angular
  .module("mean.icu.ui.folderlist", [])
  .controller("FolderListController", FolderListController);
