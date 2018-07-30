'use strict';

angular.module('mean.icu.ui.officeDocumentdetails', []).controller('OfficeDocumentDetailsController', OfficeDocumentDetailsController);

function OfficeDocumentDetailsController($scope, $rootScope, entity, tasks, people, officeDocuments, context, $state, OfficeDocumentsService, ActivitiesService, SignaturesService, EntityService, PermissionsService, $stateParams, $timeout, $http) {

  // ==================================================== init ==================================================== //

  if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("officeDocuments"))) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }
  if (Array.isArray($scope.item)) {
    $scope.item = $scope.item[0];
  }

  if (!$scope.item) {
    $state.go('main.officeDocuments.byentity', {
      entity: context.entityName,
      entityId: context.entityId
    });
  } else if ($scope.item && ($state.current.name === 'main.officeDocuments.all.details' || $state.current.name === 'main.search.officeDocument' || $state.current.name === 'main.officeDocuments.byentity.details')) {
    $state.go('.activities');
  }

  $scope.editorOptions = {
    theme: 'bootstrap',
    buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
  };
  $scope.statuses = ['new', 'in-progress', 'received', 'sent', 'done'];

  $scope.entity = entity || context.entity;
  $scope.tags = ['tag'];
  $scope.tasks = tasks.data || tasks;
  $scope.items = officeDocuments.data || officeDocuments;

  var currentState = $state.current.name;

  // backup for previous changes - for updates
  var backupEntity = JSON.parse(JSON.stringify($scope.item));

  $scope.people = people.data || people;
  if ($scope.people[Object.keys($scope.people).length - 1].name !== 'no select') {
    var newPeople = {
      name: 'no select'
    };

    $scope.people.push(_(newPeople).clone());
  }
  for (var i = 0; i < $scope.people.length; i++) {
    if ($scope.people[i] && ($scope.people[i].job == undefined || $scope.people[i].job == null)) {
      $scope.people[i].job = $scope.people[i].name;
    }
  }

  $scope.getSignatures = function() {
    if ($scope.item.folder && $scope.item.folder.office && $scope.item.path) {
      SignaturesService.getByOfficeId($scope.item.folder.office._id || $scope.item.folder.office).then(function(result) {
        if (result.length > 0) {
          $scope.signatures = result;
        }
      });
    }
  }
  $scope.getSignatures();

  $scope.signBy = $scope.item.signBy;
  $scope.selectedSignature;

  $scope.SignatureSelected = function(signature) {
    $scope.selectedSignature = signature;
  }

  $scope.Sign = function() {}

  OfficeDocumentsService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  // ==================================================== onChanges ==================================================== //

  function navigateToDetails(officeDocument) {
    $scope.detailsState = context.entityName === 'all' ? 'main.officeDocuments.all.details' : 'main.officeDocuments.byentity.details';

    $state.go($scope.detailsState, {
      id: officeDocument._id,
      entity: context.entityName,
      entityId: context.entityId,
      starred: $stateParams.starred
    }, {
      reload: true
    });
  }

  $scope.onStar = function(value) {
    OfficeDocumentsService.star($scope.item).then(function () {
      navigateToDetails($scope.item);
      // "$scope.item.star" will be change in 'ProjectsService.star' function
    });
  }

  $scope.onAssign = function(value) {
    $scope.item.assign = value;
    var json = {
      'name': 'assign',
      'newVal': $scope.item.assign
    };

    if ($scope.item.assign != null) {
      // check the assignee is not a watcher already
      let filtered = $scope.item.watchers.filter(watcher => {
          return watcher._id == $scope.item.assign
        }
      );

      let index = $scope.item.watchers.findIndex(function (watcher) {
        console.log("watcher", watcher);
        return watcher === $scope.item.assign;
      });

      // add assignee as watcher
      if (filtered.length == 0 && index === -1) {
        console.log("officeDocument updateAssign updating:")
        $scope.item.watchers.push($scope.item.assign);
        console.log($scope.item.watchers);
      }
    }

    OfficeDocumentsService.updateDocument($scope.item._id, json);
    OfficeDocumentsService.updateAssign($scope.item, backupEntity).then(function (result) {
      backupEntity = JSON.parse(JSON.stringify($scope.item));
      ActivitiesService.data = ActivitiesService.data || [];
      ActivitiesService.data.push(result);
    });
  }

  $scope.onDateDue = function(value) {
    $scope.item.due = value;
    $scope.update($scope.officeDocument, {
      name: 'due'
    });
  }

  $scope.onStatus = function(value) {
    $scope.item.status = value;
    var context = {
      "name": "status",
      "newVal": $scope.item.status,
      "oldVal": officeDoc.status
    };
    $scope.update($scope.item, context);
  }

  $scope.onTags = function(value) {
    var context = {
      name: 'tags',
      oldVal: $scope.item.tags,
      newVal: value,
      action: 'changed'
    };
    $scope.update($scope.item, context);
  }

  $scope.onCategory = function(value) {
    let folderId = value && value._id || undefined;
    var json = {
      'name': 'folder',
      'newVal': folderId,
    };
//     if (!$scope.item.folder) {
//       $scope.item.watchers = $scope.item.folder.watchers.concat($scope.item.watchers);
//     }
    $scope.item.watchers = _.map(_.groupBy($scope.item.watchers, function (doc) {
      return doc._id || doc;
    }), function (grouped) {
      return grouped[0];
    });
    json.watchers = $scope.item.watchers;
    OfficeDocumentsService.updateDocument($scope.item._id, json).then(function (res) {
      OfficeDocumentsService.updateEntity($scope.item, backupEntity).then(function (result) {
        if (folderId == undefined) {
          delete $scope.item.folder;
          $scope.signatures = undefined;
        } else {
          $scope.getSignatures();
        }
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
    });
  }

  // ==================================================== Menu events ==================================================== //

  $scope.recycle = function() {
    EntityService.recycle('officeDocuments', $scope.item._id).then(function() {
      let clonedEntity = JSON.parse(JSON.stringify($scope.item));
      clonedEntity.status = "Recycled"
      // just for activity status
      OfficeDocumentsService.updateStatus(clonedEntity, $scope.item).then(function(result) {
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
        $state.go('main.officeDocuments.all', {
          entity: 'all'
        }, {
          reload: true
        });
      }
    });
  }

  $scope.recycleRestore = function() {
    EntityService.recycleRestore('officeDocuments', $scope.item._id).then(function() {
      let clonedEntity = JSON.parse(JSON.stringify($scope.item));
      clonedEntity.status = "un-deleted"
      // just for activity status
      OfficeDocumentsService.updateStatus(clonedEntity, $scope.item).then(function(result) {
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
        var state = 'main.officeDocuments.all';
        $state.go(state, {
          entity: context.entityName,
          entityId: context.entityId
        }, {
          reload: true
        });
      }
    });
  }

  function refreshList() {
    $rootScope.$broadcast('refreshList');
  }

  $scope.menuItems = [{
    label: 'recycleOfficeDocument',
    icon: 'times-circle',
    fa: 'fa-times-circle',
    display: !$scope.item.hasOwnProperty('recycled'),
    action: $scope.recycle,
  }, {
    label: 'unrecycleOfficeDocument',
    icon: 'times-circle',
    fa: 'fa-times-circle',
    display: $scope.item.hasOwnProperty('recycled'),
    action: $scope.recycleRestore,
  }];

  // ==================================================== Buttons ==================================================== //

  $scope.addSerialTitle = function(document1) {
    $scope.settingSerial = true;
    OfficeDocumentsService.addSerialTitle(document1).then(function(result) {
      $scope.settingSerial = false;
      if (result && result.spPath) {
        document1.spPath = result.spPath;
      }
      if (result && result.serial) {
        document1.serial = result.serial;
      }
    });
  }

  $scope.signatory = false;
  $scope.signOnDocx = function(document1) {
    //if(document1.spPath){
    $scope.signatory = true;
    OfficeDocumentsService.signOnDocx(document1, $scope.selectedSignature).then(function(result) {
      if (result && result.spPath) {
        document1.spPath = result.spPath;
        document1.signBy = result.signBy;
        $scope.signatory = false;
      }
      $scope.signatory = false;
      $scope.signBy = JSON.parse($scope.selectedSignature);
    });
    // }
  }

  $scope.sendDocument = function(document1) {}

  $scope.uploadEmpty = function(document1) {
    OfficeDocumentsService.uploadEmpty(document1).then(function(result) {
      $state.reload();
    });
  }

  $scope.view = function(document1) {
    if (document1.spPath) {
      var spSite = document1.spPath.substring(0, document1.spPath.indexOf('ICU') + 3);

      var uri = spSite + "/_layouts/15/WopiFrame.aspx?sourcedoc=" + document1.spPath + "&action=default";

      window.open(uri, '_blank');
    } else {
      // Check if need to view as pdf
      if ((document1.documentType == "docx") || (document1.documentType == "doc") || (document1.documentType == "xlsx") || (document1.documentType == "xls") || (document1.documentType == "ppt") || (document1.documentType == "pptx")) {
        var arr = document1.path.split("." + document1.documentType);
        var ToHref = arr[0] + ".pdf";
        // Check if convert file exists allready

        $http({
          url: ToHref.replace('/files/', '/api/files/'),
          method: 'HEAD'
        }).success(function() {
          // There is allready the convert file
          window.open(ToHref + '?view=true')
        }).error(function() {
          // Send to server
          $.post('/officeDocsAppend.js', document1).done(function(document2) {
            // The convert is OK and now we open the pdf to the client in new window
            window.open(ToHref + '?view=true');
          }).fail(function(xhr) {
            console.error(xhr.responseText);
          });
        });
      }// Format is NOT needed to view as pdf
      else {
        window.open(document1.path + '?view=true');
      }
    }
  }

  $scope.upload = function(file) {
    if (file.length > 0) {
      $scope.uploading = true;
    }
    $scope.test = file;
    var data = {
      'id': $stateParams.id,
      'folderId': $stateParams.entityId
    };
    if (file.length > 0) {
      OfficeDocumentsService.uploadFileToDocument(data, file).then(function(result) {
        $scope.uploading = false;
        $scope.item.title = result.data.title;
        $scope.item.path = result.data.path;
        $scope.item.spPath = result.data.spPath;
        $scope.item.documentType = result.data.documentType;
        $scope.getSignatures();

      }, function(resp) {
        console.log('Error status: ' + resp.status);
      }, function(evt) {
        $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      });
    }
  }

  $scope.deleteDocumentFile = function(officeDocument) {
    OfficeDocumentsService.deleteDocumentFile(officeDocument._id).then(function() {
      officeDocument.path = undefined;
      officeDocument.spPath = undefined;
      $scope.signatures = undefined;
    });
  }

  $scope.updateStatusForApproval = function(entity) {
    let context = {
      action: "updated",
      name: "status",
      type: "project"
    }
    entity.status = "waiting-approval";
    $scope.update(entity, context);
  }

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal && oVal) {
      var newContext = {
        name: 'title',
        oldVal: oVal,
        newVal: nVal,
        action: 'renamed'
      };
      $scope.delayedUpdate($scope.item, newContext);
    }
  });

  var nText, oText;
  $scope.$watch('item.description', function(nVal, oVal) {
    nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    if (nText != oText && oText) {
      var newContext = {
        name: 'description',
        oldVal: oVal,
        newVal: nVal,
      };
      $scope.delayedUpdate($scope.item, newContext);
    }
  });

  // ==================================================== Update ==================================================== //

  $scope.update = function(officeDocument, context) {

    OfficeDocumentsService.updateDocument(officeDocument._id, context).then(function(res) {});
    ActivitiesService.data = ActivitiesService.data || [];
    var me = $scope.me;
    switch (context.name) {
    case 'due':
      OfficeDocumentsService.updateDue(officeDocument, backupEntity).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;
    case 'status':
      OfficeDocumentsService.updateStatus(officeDocument, backupEntity).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;
    case 'title':
    case 'description':
      OfficeDocumentsService.updateTitle(officeDocument, backupEntity, context.name).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
        refreshList();
      });
      break;
    }

    if (currentState.indexOf('search') != -1) {
      refreshList();
    }
  }

  $scope.updateCurrentOfficeDocument = function() {
    OfficeDocumentsService.currentOfficeDocumentName = $scope.item.title;
  }

  $scope.delayedUpdate = _.debounce($scope.update, 2000);

  // ==================================================== havePermissions ==================================================== //

  $scope.isRecycled = $scope.entity.hasOwnProperty('recycled');
  $scope.enableRecycled = true;

  $scope.havePermissions = function(type, enableRecycled) {
    enableRecycled = enableRecycled || !$scope.isRecycled;
    return (PermissionsService.havePermissions($scope.entity, type) && enableRecycled);
  }

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.entity);
  }

}
