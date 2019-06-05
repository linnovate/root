"use strict";

angular
  .module("mean.icu.ui.officeDocumentdetails", [])
  .controller(
    "OfficeDocumentDetailsController",
    OfficeDocumentDetailsController
  );

function OfficeDocumentDetailsController(
  $scope,
  $rootScope,
  entity,
  tasks,
  people,
  officeDocuments,
  context,
  $state,
  OfficesService,
  TasksService,
  NotifyingService,
  OfficeDocumentsService,
  ActivitiesService,
  SignaturesService,
  EntityService,
  PermissionsService,
  $stateParams,
  UsersService,
  DetailsPaneService,
  $timeout,
  $http
) {
  // ==================================================== init ==================================================== //

  $scope.tabs = DetailsPaneService.orderTabs([
    "activities",
    "documents",
    "tasks"
  ]);

  if (
    $state.$current.url.source.includes("search") ||
    $state.$current.url.source.includes("officeDocuments")
  ) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }
  if (Array.isArray($scope.item)) {
    $scope.item = $scope.item[0] || context.entity;
  }
  if (typeof $scope.item.creator === "string") {
    UsersService.getById($scope.item.creator).then(
      creator => ($scope.item.creator = creator)
    );
  }
  if (!$scope.item.color || !$scope.item.folder)
    OfficeDocumentsService.getById($scope.item.id || $scope.item._id).then(
      doc => {
        Object.assign($scope.item, doc);
      }
    );

  if (!$scope.item) {
    $state.go("main.officeDocuments.byentity", {
      entity: context.entityName,
      entityId: context.entityId
    });
  } else if (
    $scope.item &&
    ($state.current.name === "main.officeDocuments.all.details" ||
      $state.current.name === "main.search.officeDocument" ||
      $state.current.name === "main.officeDocuments.byentity.details")
  ) {
    $state.go("." + window.config.defaultTab);
  }

  $scope.editorOptions = {
    theme: "bootstrap",
    buttons: [
      "bold",
      "italic",
      "underline",
      "anchor",
      "quote",
      "orderedlist",
      "unorderedlist"
    ]
  };
  $scope.statuses = ["new", "in-progress", "received", "sent", "done"];

  $scope.entity = entity || context.entity;
  $scope.tags = ["tag"];
  $scope.tasks = tasks.data || tasks;
  $scope.items = officeDocuments.data || officeDocuments;

  var currentState = $state.current.name;

  // backup for previous changes - for updates
  var backupEntity = angular.copy($scope.item);

  $scope.people = people;

  $scope.getSignatures = function() {
    if ($scope.item.folder && $scope.item.folder.office && $scope.item.path) {
      SignaturesService.getByOfficeId(
        $scope.item.folder.office._id || $scope.item.folder.office
      ).then(function(result) {
        if (result.length > 0) {
          $scope.signatures = result;
        }
      });
    }
  };
  $scope.getSignatures();

  $scope.signBy = $scope.item.signBy;
  $scope.selectedSignature;

  $scope.SignatureSelected = function(signature) {
    $scope.selectedSignature = signature;
  };

  $scope.Sign = function() {};

  OfficeDocumentsService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  // ==================================================== onChanges ==================================================== //

  $scope.onStar = function(value) {
    $scope.update($scope.item, {
      name: "star"
    });

    OfficeDocumentsService.star($scope.item).then(function() {
      $state.reload();
    });
  };

  $scope.onAssign = function(value) {
    $scope.item.assign = value;
    var json = {
      name: "assign",
      newVal: $scope.item.assign
    };

    if ($scope.item.assign != null) {
      // check the assignee is not a watcher already
      let filtered = $scope.item.watchers.filter(watcher => {
        return watcher._id == $scope.item.assign;
      });

      let index = $scope.item.watchers.findIndex(function(watcher) {
        console.log("watcher", watcher);
        return watcher === $scope.item.assign;
      });

      // add assignee as watcher
      if (filtered.length == 0 && index === -1) {
        console.log("officeDocument updateAssign updating:");
        $scope.item.watchers.push($scope.item.assign);
        console.log($scope.item.watchers);
      }
    }

    $scope.update($scope.item, {
      name: "assign",
      newVal: $scope.item.assign
    });
  };

  $scope.onDateDue = function(value) {
    $scope.item.due = value;
    $scope.update($scope.item, {
      name: "due",
      value: value
    });
  };

  $scope.onStatus = function(value) {
    $scope.item.status = value;
    var context = {
      name: "status",
      newVal: $scope.item.status
      //"oldVal": officeDoc.status
    };
    $scope.update($scope.item, context);
  };

  $scope.onTags = function(value) {
    var context = {
      name: "tags",
      oldVal: $scope.item.tags,
      newVal: value,
      action: "changed"
    };
    $scope.update($scope.item, context);
  };

  $scope.onCategory = function(value, type = "folder") {
    let id = (value && value._id) || undefined;
    let json = {
      name: type,
      newVal: id
    };

    $scope.item.watchers = _.map(
      _.groupBy($scope.item.watchers, function(doc) {
        return doc._id || doc;
      }),
      function(grouped) {
        return grouped[0];
      }
    );
    json.watchers = $scope.item.watchers;
    OfficeDocumentsService.updateDocument($scope.item._id, json).then(function(
      res
    ) {
      OfficeDocumentsService.getById($scope.item._id).then(doc => {
        if (!id) {
          delete $scope.item.folder;
          $scope.signatures = undefined;
        } else {
          $scope.getSignatures();
        }
        //Update the scope with the response from server
        $scope.item.watchers = doc.watchers;
        $scope.item.permissions = doc.permissions;

        backupEntity = angular.copy($scope.item);
      });
    });
  };

  $scope.setFolderIndex = function(item) {
    if (!item.folderIndex) {
      OfficeDocumentsService.getFolderIndex(item).then(data =>
        Object.assign(item, { folderIndex: data.folderIndex })
      );
    }
  };

  // ==================================================== Menu events ==================================================== //

  $scope.recycle = function() {
    EntityService.recycle('officeDocuments', $scope.item._id).then(function() {
      $scope.item.recycled = new Date();
      let clonedEntity = angular.copy($scope.item);
      clonedEntity.status = "Recycled";
      // just for activity status
      OfficeDocumentsService.updateStatus(clonedEntity, $scope.item).then(
        function(result) {
          ActivitiesService.data.push(result);
        }
      );

      refreshList();
      $scope.isRecycled = $scope.item.hasOwnProperty('recycled');
      $scope.permsToSee();
      $scope.havePermissions();
      $scope.haveEditiorsPermissions();
    });
  };

  $scope.recycleRestore = function() {
    EntityService.recycleRestore("officeDocuments", $scope.item._id).then(
      function() {
        let clonedEntity = angular.copy($scope.item);
        clonedEntity.status = "un-deleted";
        // just for activity status
        OfficeDocumentsService.updateStatus(clonedEntity, $scope.item).then(
          function(result) {
            ActivitiesService.data.push(result);
          }
        );

        refreshList();
        if (currentState.indexOf("search") != -1) {
          $state.go(
            currentState,
            {
              entity: context.entityName,
              entityId: context.entityId
            },
            {
              reload: true,
              query: $stateParams.query
            }
          );
        } else {
          var state = "main.officeDocuments.all";
          $state.go(
            state,
            {
              entity: context.entityName,
              entityId: context.entityId
            },
            {
              reload: true
            }
          );
        }
      }
    );
  };

  function refreshList() {
    $rootScope.$broadcast("refreshList");
  }

  $scope.menuItems = [
    {
      label: "recycleOfficeDocument",
      fa: "fa-times-circle",
      display: !$scope.item.hasOwnProperty("recycled"),
      action: $scope.recycle
    },
    {
      label: "unrecycleOfficeDocument",
      fa: "fa-times-circle",
      display: $scope.item.hasOwnProperty("recycled"),
      action: $scope.recycleRestore
    }
  ];

  // ==================================================== Buttons ==================================================== //

  $scope.addSerialTitle = function(document1) {
    $scope.settingSerial = true;
    if (
      document1.folder &&
      document1.folder.office &&
      document1.folder.office.title
    ) {
      OfficeDocumentsService.addSerialTitle(document1).then(function(result) {
        $scope.settingSerial = false;
        if (result && result.spPath) {
          document1.spPath = result.spPath;
        }
        if (result && result.serial) {
          document1.serial = result.serial;
        }
      });
    } else {
      OfficeDocumentsService.getById(document1._id).then(function(docresult) {
        if (
          docresult.folder &&
          docresult.folder.office &&
          docresult.folder.office.title
        ) {
          OfficeDocumentsService.addSerialTitle(docresult).then(function(
            result
          ) {
            $scope.settingSerial = false;
            if (result && result.spPath) {
              document1.spPath = result.spPath;
            }
            if (result && result.serial) {
              document1.serial = result.serial;
            }
          });
        } else if (!docresult.folder) {
          OfficeDocumentsService.addSerialTitle(document1).then(function(
            result
          ) {
            $scope.settingSerial = false;
            if (result && result.spPath) {
              document1.spPath = result.spPath;
            }
            if (result && result.serial) {
              document1.serial = result.serial;
            }
          });
        } else {
          OfficesService.getById(docresult.folder.office).then(function(
            office
          ) {
            docresult.folder.office = office;
            OfficeDocumentsService.addSerialTitle(docresult).then(function(
              result
            ) {
              $scope.settingSerial = false;
              if (result && result.spPath) {
                document1.spPath = result.spPath;
              }
              if (result && result.serial) {
                document1.serial = result.serial;
              }
            });
          });
        }
      });
    }
  };

  $scope.signatory = false;
  $scope.signOnDocx = function(document1) {
    //if(document1.spPath){
    $scope.signatory = true;
    OfficeDocumentsService.signOnDocx(document1, $scope.selectedSignature).then(
      function(result) {
        if (result && result.spPath) {
          document1.spPath = result.spPath;
          document1.signBy = result.signBy;
          $scope.signatory = false;
        }
        $scope.signatory = false;
        $scope.signBy = JSON.parse($scope.selectedSignature);
      }
    );
    // }
  };

  $scope.sendDocument = function(document1) {};

  $scope.uploadEmpty = function(document1) {
    OfficeDocumentsService.uploadEmpty(document1).then(function(result) {
      $state.reload();
    });
  };

  $scope.view = function(document1) {
    if (document1.mmhpath) {
      var mmhPath = document1.mmhpath.replace(/\//g, "%2f");
      OfficeDocumentsService.getFileFtp(mmhPath).then(function(result) {
        if (result.status == 404) {
          alertify.logPosition("top left");
          alertify.error("הקובץ לא קיים!");
        }
      });
    } else if (document1.spPath) {
      var spSite = document1.spPath.substring(
        0,
        document1.spPath.indexOf("ICU") + 3
      );
      var uri =
        spSite +
        "/_layouts/15/WopiFrame.aspx?sourcedoc=" +
        document1.spPath +
        "&action=default";
      window.open(uri, "_blank");
    } else {
      console.log("PATH");
      var path = document1.path;
      path = path.substring(path.indexOf("/files"), path.length);
      console.log(path);
      path = path.replace(/\//g, "%2f");
      OfficeDocumentsService.getFileFtp(path).then(function(result) {
        if (result.status == 404) {
          alertify.logPosition("top left");
          alertify.error("הקובץ לא קיים!");
        }
      });

      /**

            // Check if need to view as pdf
            if (document1.documentType == "docx" || document1.documentType == "doc" || document1.documentType == "xlsx" || document1.documentType == "xls" || document1.documentType == "ppt" || document1.documentType == "pptx") {
                var arr = document1.path.split("." + document1.documentType);
                var ToHref = arr[0] + ".pdf";
                // Check if convert file exists allready

                $http({
                    url: ToHref.replace('/files/', '/api/files/'),
                    method: 'HEAD'
                }).success(function () {
                    // There is allready the convert file
                    window.open(ToHref + '?view=true');
                }).error(function () {
                    // Send to server
                    $.post('/officeDocsAppend.js', document1).done(function (document2) {
                        // The convert is OK and now we open the pdf to the client in new window
                        window.open(ToHref + '?view=true');
                    }).fail(function (xhr) {
                        console.error(xhr.responseText);
                    });
                });
            }
            // Format is NOT needed to view as pdf
            else {
                    window.open(document1.path + '?view=true');
                }
                */
    }
  };

  $scope.upload = function(file) {
    if (file.length > 0) {
      $scope.uploading = true;
    }
    $scope.test = file;
    var data = {
      id: $stateParams.id,
      folderId: $stateParams.entityId
    };
    if (file.length > 0) {
      OfficeDocumentsService.uploadFileToDocument(data, file).then(
        function(result) {
          $scope.uploading = false;
          $scope.item.title = result.data.title;
          $scope.item.path = result.data.path;
          $scope.item.spPath = result.data.spPath;
          $scope.item.documentType = result.data.documentType;
          $scope.getSignatures();
        },
        function(resp) {
          console.log("Error status: " + resp.status);
        },
        function(evt) {
          $scope.progressPercentage = parseInt(
            (100.0 * evt.loaded) / evt.total
          );
        }
      );
    }
  };

  $scope.deleteDocumentFile = function(officeDocument) {
    OfficeDocumentsService.deleteDocumentFile(officeDocument._id).then(
      function() {
        officeDocument.path = undefined;
        officeDocument.spPath = undefined;
        $scope.signatures = undefined;
      }
    );
  };

  $scope.updateStatusForApproval = function(entity) {
    let context = {
      action: "updated",
      name: "status",
      type: "project"
    };
    entity.status = "waiting-approval";
    $scope.update(entity, context);
  };

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal) {
      delayedUpdateTitle($scope.item, {
        name: 'title',
        oldVal: oVal,
        newVal: nVal,
        action: 'renamed'
      });
    }
  });

  $scope.$watch('item.description', function(nVal, oVal) {
    if (nVal !== oVal) {
      delayedUpdateDesc($scope.item, {
        name: 'description',
        oldVal: oVal,
        newVal: nVal,
        action: 'renamed'
      });
    }
  });

  // ==================================================== Update ==================================================== //

  $scope.update = function(officeDocument, context) {
    OfficeDocumentsService.updateDocument(officeDocument._id, context).then(
      function(res) {
        Object.assign(officeDocument, res);
        ActivitiesService.data = ActivitiesService.data || [];
        var me = $scope.me;
        switch (context.name) {
          case "due":
            OfficeDocumentsService.updateDue(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
            });
            break;
          case "star":
            OfficeDocumentsService.updateStar(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
            });
            break;
          case "tags":
            OfficeDocumentsService.updateTags(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
            });
            break;
          case "assign":
            OfficeDocumentsService.updateAssign(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
            });
            break;
          case "status":
            OfficeDocumentsService.updateStatus(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
              refreshList();
            });
            break;
          case "title":
            OfficeDocumentsService.updateTitle(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
              refreshList();
            });
            break;
          case "description":
            OfficeDocumentsService.updateDescription(
              officeDocument,
              me,
              backupEntity
            ).then(function(result) {
              backupEntity = angular.copy($scope.item);
              ActivitiesService.data = ActivitiesService.data || [];
              ActivitiesService.data.push(result);
              refreshList();
            });
            break;
        }

        if (currentState.indexOf("search") != -1) {
          refreshList();
        }
      }
    );
  };

  $scope.updateCurrentOfficeDocument = function() {
    OfficeDocumentsService.currentOfficeDocumentName = $scope.item.title;
  };

  var delayedUpdateTitle = _.debounce($scope.update, 2000);
  var delayedUpdateDesc = _.debounce($scope.update, 2000);

  // ==================================================== havePermissions ==================================================== //

  $scope.isRecycled = $scope.entity.hasOwnProperty("recycled");
  $scope.enableRecycled = true;

  $scope.havePermissions = function(type, enableRecycled) {
    enableRecycled = enableRecycled || !$scope.isRecycled;
    return (
      PermissionsService.havePermissions($scope.item, type) && enableRecycled
    );
  };

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.item);
  };
}
