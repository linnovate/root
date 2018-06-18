'use strict';

angular.module('mean.icu.ui.attachmentdetails', []).controller('AttachmentDetailsController', AttachmentDetailsController);

function AttachmentDetailsController($scope, $http, entity, tasks, context, $state, AttachmentsService, DocumentsService, UsersService, EntityService, TasksService, $stateParams) {

  // ==================================================== init ==================================================== //

  if ($scope.update && $state.current.name === 'main.search.update') {
    $state.go('.versions');
  }

  $scope.update = entity || context.entity;
  $scope.item = entity;

  $scope.tasks = tasks;

  let attachment = $scope.item;

  $scope.attName = attachment.name;
  $scope.attCreated = attachment.created;
  $scope.attSize = attachment.size;
  $scope.attCreator = null;
  $scope.attUser;
  UsersService.getById(attachment.creator).then(user=>$scope.attUser = user);
  $scope.attPath = attachment.path;
  $scope.attPrint = attachment.size;
  $scope.attType = attachment.attachmentType;
  $scope.attLinkToEntityName;
  EntityService.getByEntityId(attachment.entity, attachment.entityId).then(res=>$scope.attLinkToEntityName = res);

  $scope.attLinkToEntity = '/' + attachment.entity + '/all/' + attachment.entityId + '/documents';

  if($scope.item.entity === 'task'){
      TasksService.getById($scope.item.entityId).then(task=>{
          $scope.item.project = task.project;
      });
  }

  $scope.$watchGroup(['item.description', 'item.title'], function(nVal, oVal) {
    if (nVal !== oVal && oVal) {
      $scope.delayedUpdate($scope.update);
    }
  });

  $scope.viewAttachment = function(document1) {
    return (document1.path + '?view=true');
  }

  $scope.previewTab = function(document) {
    AttachmentsService.previewTab(document);
  }

  $scope.update = function(update) {
    DocumentsService.update(update);
  }

  $scope.delayedUpdate = _.debounce($scope.update, 500);

  // ==================================================== Menu events ==================================================== //

//   $scope.deleteUpdate = function(update) {
//     DocumentsService.remove(update._id).then(function() {
//       $state.reload();
//     });
//   }

//   $scope.menuItems = [{
//     label: 'deleteAttachment',
//     icon: 'times-circle',
//     display: !$scope.item.hasOwnProperty('recycled'),
//     action: $scope.recycle,
//   }];

}
