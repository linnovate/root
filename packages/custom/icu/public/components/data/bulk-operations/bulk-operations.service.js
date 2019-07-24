"use strict";

angular
  .module("mean.icu.data.multipleselectservice", [])
  .service("MultipleSelectService", function(
    ApiUri,
    $http,
    $state,
    $stateParams,
    $rootScope,
    OfficesService,
    UsersService
  ) {
    let EntityPrefix = "/bulk";
    let me = UsersService.getMe().$$state.value;
    let selectedItems = [];

    let selectedEntityArrays = {
      task: [],
      project: [],
      discussion: [],
      officeDocument: [],
      folder: [],
      office: [],
      templateDoc: []
    };

    let bulkPermissionsMap = {
      status: ["editor"],
      assign: ["editor"],
      watchers: ["editor"],
      due: ["editor"],
      tag: ["editor"],
      delete: ["editor"]
    };

    let bulkShowingMap = {
      status: [
        "tasks",
        "projects",
        "discussions",
        "officeDocuments",
        "folders"
      ],
      assign: ["tasks", "projects", "discussions", "officeDocuments"],
      watchers: [
        "tasks",
        "projects",
        "discussions",
        "officeDocuments",
        "folders",
        "offices"
      ],
      due: ["tasks", "projects", "discussions", "officeDocuments"],
      tag: ["tasks", "projects", "discussions", "officeDocuments", "folders"],
      delete: [
        "tasks",
        "projects",
        "discussions",
        "officeDocuments",
        "folders",
        "offices",
        "templateDocs"
      ]
    };

    function showButton(operation) {
      return Object.keys(selectedEntityArrays).every(entity => {
        return (
          selectedEntityArrays[entity].length === 0 ||
          _.includes(bulkShowingMap[operation], entity + "s")
        );
      });
    }

    let cornerStates = ["all", "some", "none"];

    let cornerState = cornerStates[0];

    function refreshCornerState(itemsLength) {
      if (itemsLength === selectedItems.length && itemsLength !== 0) {
        cornerState = cornerStates[0];
      } else if (
        itemsLength > selectedItems.length &&
        selectedItems.length !== 0
      ) {
        cornerState = cornerStates[1];
      } else {
        cornerState = cornerStates[2];
      }
      return cornerState;
    }

    function getCornerState() {
      return cornerState;
    }

    function changeCornerState() {
      if (cornerState === "all") {
        cornerState = cornerStates[2];
      } else if (cornerState === "some" || cornerState === "none") {
        cornerState = cornerStates[0];
      }
      return cornerState;
    }

    function getSelected() {
      return selectedItems;
    }

    function getSelectedEntityArrays() {
      return selectedEntityArrays;
    }

    function setSelectedList(list) {
      return (selectedItems = list);
    }

    function refreshSelectedList(editedEntity) {
      if (!editedEntity) {
        Object.keys(selectedEntityArrays).forEach(
          entity => (selectedEntityArrays[entity] = [])
        );
        return (selectedItems = []);
      }

      let entityType = editedEntity._type || getEntityType();
      let entitySelectedIndex = selectedItems.findIndex(entity => {
        return entity._id === editedEntity._id;
      });
      if (!selectedEntityArrays[entityType]) return selectedItems;

      if (entitySelectedIndex === -1) {
        selectedItems.push(editedEntity);
        selectedEntityArrays[entityType].push(editedEntity);
      } else {
        selectedItems.splice(entitySelectedIndex, 1);

        let selectedTypesIndex = selectedEntityArrays[entityType].findIndex(
          entity => entity._id === editedEntity._id
        );
        selectedEntityArrays[entityType].splice(selectedTypesIndex, 1);
      }
      return selectedItems;
    }

    function getEntityType() {
      let entityType = $state.current.name.split(".")[1];
      return entityType.substring(0, entityType.length - 1);
    }

    function bulkUpdate(bulkObject, entityName) {
      if (bulkObject.update && bulkObject.update.delete) {
        return $http
          .patch(ApiUri + "/" + entityName + EntityPrefix, bulkObject)
          .then(function(result) {
            refreshSelectedList();
            return result.data;
          });
      }
      return $http
        .put(ApiUri + "/" + entityName + EntityPrefix, bulkObject)
        .then(function(result) {
          return result.data;
        });
    }

    function haveBulkPerms(type) {
      let havePermissions = selectedItems.every(entity => {
        if (!entity || !entity.permissions) return true;
        let userPermissions = entity.permissions.find(
          permission => permission.id === me._id
        );
        return userPermissions
          ? _.includes(bulkPermissionsMap[type], userPermissions.level)
          : false;
      });

      return havePermissions;
    }

    return {
      bulkUpdate: bulkUpdate,
      haveBulkPerms: haveBulkPerms,
      showButton: showButton,
      setSelectedList: setSelectedList,
      getSelected: getSelected,
      getSelectedEntityArrays: getSelectedEntityArrays,
      getCornerState: getCornerState,
      refreshSelectedList: refreshSelectedList,
      refreshCornerState: refreshCornerState,
      changeCornerState: changeCornerState
    };
  });
