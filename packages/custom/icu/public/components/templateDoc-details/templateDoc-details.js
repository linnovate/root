'use strict';

angular.module('mean.icu.ui.templateDocdetails', []).controller('TemplateDocDetailsController', TemplateDocDetailsController);

function TemplateDocDetailsController($scope, $http, entity, tasks, folders, people, templateDocs, context, $state, TemplateDocsService, PermissionsService, $stateParams) {

  if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("templateDocs"))) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }

  if (!$scope.item) {
    $state.go('main.templateDocs.byentity', {
      entity: context.entityName,
      entityId: context.entityId
    });
  } else if ($scope.item && ($state.current.name === 'main.templateDocs.all.details' || $state.current.name === 'main.search.templateDoc' || $state.current.name === 'main.templateDocs.byentity.details')) {
    $state.go('.activities');
  }

  $scope.options = {
    theme: 'bootstrap',
    buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
  };
  $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

  $scope.entity = entity || context.entity;
  $scope.tasks = tasks.data || tasks;
  $scope.folders = folders.data || folders;
  $scope.items = templateDocs.data || templateDocs;

  $scope.people = people.data || people;

  // ==================================================== onChanges ==================================================== //

  $scope.onCategory = function(value) {
    var json = {
      'name': 'office',
      'newVal': value && value._id,
    };
    TemplateDocsService.updateTemplateDoc($scope.item._id, json);
  }

  // ==================================================== Menu events ==================================================== //

  $scope.deleteTemplateDoc = function() {
    TemplateDocsService.delete($scope.item._id).then(function() {

      $state.go('main.templateDocs.all', {
        entity: 'all'
      }, {
        reload: true
      });
    });
  }

  $scope.menuItems = [{
    label: 'recycleTemplateDoc',
    icon: 'times-circle',
    fa: 'fa-times-circle',
    display: !$scope.item.hasOwnProperty('recycled'),
    action: $scope.deleteTemplateDoc,
  }];

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watchGroup(['item.description', 'item.title'], function(nVal, oVal, scope) {
    if (nVal !== oVal && oVal) {
      var newContext;
      if (nVal[1] !== oVal[1]) {
        newContext = {
          name: 'title',
          oldVal: oVal[1],
          newVal: nVal[1],
          action: 'renamed'
        };
        $scope.delayedUpdateTitle($scope.item, newContext);
      } else {
        newContext = {
          name: 'description',
          oldVal: oVal[0],
          newVal: nVal[0]
        };

        $scope.delayedUpdateDesc($scope.item, newContext);
      }
    }
  });


  $scope.updateTitle = function(item, newContext) {
    TemplateDocsService.updateTemplateDoc(item._id, newContext);
  }

  $scope.updateDescription = function(item, newContext) {
    TemplateDocsService.updateTemplateDoc(item._id, newContext);
  }

  $scope.delayedUpdateTitle = _.debounce($scope.updateTitle, 500);
  $scope.delayedUpdateDesc= _.debounce($scope.updateDescription, 500);

  // ==================================================== Update ==================================================== //

  $scope.view = function(document1) {
    if (document1.spPath) {
      var spSite = document1.spPath.substring(0, document1.spPath.indexOf('ICU') + 3);
      var uri = spSite + "/_layouts/15/WopiFrame.aspx?sourcedoc=" + document1.spPath + "&action=default";
      window.open(uri, '_blank');
    } else {
      // Check if need to view as pdf
      if ((document1.templateType == "docx") || (document1.templateType == "doc") || (document1.templateType == "xlsx") || (document1.templateType == "xls") || (document1.templateType == "ppt") || (document1.templateType == "pptx")) {
        var arr = document1.path.split("." + document1.templateType);
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
          $.post('/templateDocsAppend.js', document1).done(function(document2) {
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
    $scope.test = file;
    var data = {
      'id': $stateParams.id,
      'officeId': $stateParams.entityId
    };
    if (file.length > 0) {
      TemplateDocsService.uploadTemplate(data, file).then(function(result) {
        $scope.item.title = result.data.title;
        $scope.item.path = result.data.path;
        $scope.item.templateType = result.data.templateType;
        $scope.item.spPath = result.data.spPath;
      });
    }
  }


  // ==================================================== havePermissions ==================================================== //

  $scope.enableRecycled = true;
  $scope.havePermissions = function(type, enableRecycled) {
    enableRecycled = enableRecycled || !$scope.isRecycled;
    return (PermissionsService.havePermissions(entity, type) && enableRecycled);
  }

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.entity);
  }

  $scope.permsToSee = function() {
    return PermissionsService.haveAnyPerms($scope.entity);
  }

}
