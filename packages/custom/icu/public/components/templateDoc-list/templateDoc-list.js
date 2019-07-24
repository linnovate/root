"use strict";

function TemplateDocListController(
  $scope,
  $state,
  templateDocs,
  NotifyingService,
  BoldedService,
  TemplateDocsService,
  MultipleSelectService,
  context,
  $stateParams,
  EntityService
) {
  $scope.items = templateDocs.data || templateDocs;

  $scope.entityName = "templateDocs";
  $scope.entityRowTpl = "/icu/components/templateDoc-list/templateDoc-row.html";

  $scope.loadNext = templateDocs.next;
  $scope.loadPrev = templateDocs.prev;

  var creatingStatuses = {
    NotCreated: 0,
    Creating: 1,
    Created: 2
  };

  $scope.getBoldedClass = function(entity) {
    return BoldedService.getBoldedClass(entity, "templateDocs");
  };

  $scope.create = function(item) {
    var newItem = {
      title: "",
      color: "0097A7",
      watchers: [],
      __state: creatingStatuses.NotCreated,
      __autocomplete: true
    };
    return TemplateDocsService.create(newItem).then(function(result) {
      $scope.items.push(result);
      TemplateDocsService.data.push(result);
      return result;
    });
  };
}

angular
  .module("mean.icu.ui.templateDoclist", [])
  .controller("TemplateDocListController", TemplateDocListController);
