'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tabs></detail-tabs>
 */
angular.module('mean.icu.ui.detailsComponents').directive('detailTabs', detailTabs);

function detailTabs($state) {

  return {
    scope: {
      tabs: "=",
      entityName: "=",
      item: "=",
      onClick: "="
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-tabs/detail-tabs.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    $scope.onClickTab = function(tab) {
      let path = $state.$current.name.split('.');
      if (['activities', 'documents', 'tasks', 'folders', 'signatures'].includes(path.pop())) {
        path.push(tab);
        path = path.join('.')
      } else {
        path = $state.$current.name + '.' + tab;
      }
      $state.go(path);
    }

    $scope.$watch(function() {
      return $state.$current.name;
    }, function(newVal, oldVal) {
      let tab = newVal.split('.').pop();
      if ($scope.selection != tab && ['activities', 'documents', 'tasks', 'folders', 'signatures'].includes(tab)) {
        $scope.selection = tab;
        //         $scope.onClick(tab);
      }
    });

  }
}

angular.module('mean.icu.ui.detailsComponents').controller('TaskActivitiesController', function($scope, entity, context, activities, tasks, ActivitiesService) {
  $scope.activities = activities;
  ActivitiesService.data = $scope.activities;
  var tasksNames = _.object(_.pluck(tasks, '_id'), _.pluck(tasks, 'title'));
  $scope.activities.forEach(function(a) {
    a.taskName = tasksNames[a.issueId];
  })
});

angular.module('mean.icu.ui.detailsComponents').controller('TaskDocumentsController', function($scope, entity, context, documents, tasks, AttachmentsService) {
  $scope.documents = documents;
  var tasksNames = _.object(_.pluck(tasks, '_id'), _.pluck(tasks, 'title'));
  $scope.documents.map(doc=>AttachmentsService.getAttachmentUser(doc.creator).then(user=>doc.attUser = user.name))
  $scope.documents.forEach(function(a) {
    a.taskName = tasksNames[a.issueId];
  })
});

angular.module('mean.icu.ui.detailsComponents').controller('ProjectActivitiesController', function($scope, entity, context, activities, ActivitiesService) {
  $scope.activities = activities;
  ActivitiesService.data = $scope.activities;
});
angular.module('mean.icu.ui.detailsComponents').controller('ProjectDocumentsController', function($scope, entity, context, documents, AttachmentsService) {
  $scope.documents = documents;
  $scope.documents.map(doc=>AttachmentsService.getAttachmentUser(doc.creator).then(user=>doc.attUser = user.name))

});
angular.module('mean.icu.ui.detailsComponents').controller('ProjectTasksController', function($scope, entity, context, tasks, $state) {
  $scope.tasks = tasks;
});

angular.module('mean.icu.ui.detailsComponents').controller('DiscussionActivitiesController', function($scope, entity, context, activities, ActivitiesService) {
  $scope.activities = activities;
  ActivitiesService.data = $scope.activities;
});
angular.module('mean.icu.ui.detailsComponents').controller('DiscussionDocumentsController', function($scope, entity, context, documents, AttachmentsService) {
  $scope.documents = documents;
  $scope.documents.map(doc=>AttachmentsService.getAttachmentUser(doc.creator).then(user=>doc.attUser = user.name))
});
angular.module('mean.icu.ui.detailsComponents').controller('DiscussionTasksController', function($scope, entity, context, tasks, $state) {
  $scope.tasks = tasks;
});

angular.module('mean.icu.ui.detailsComponents').controller('FolderActivitiesController', function($scope, entity, context, activities, ActivitiesService) {
  $scope.activities = activities;
  ActivitiesService.data = $scope.activities;
});
angular.module('mean.icu.ui.detailsComponents').controller('FolderDocumentsController', function($scope, entity, context, documents, AttachmentsService) {
  $scope.documents = documents;
});
angular.module('mean.icu.ui.detailsComponents').controller('FolderTasksController', function($scope, entity, context, tasks, $state) {
  $scope.tasks = tasks;
});

angular.module('mean.icu.ui.detailsComponents').controller('OfficeActivitiesController', function($scope, entity, context, activities, ActivitiesService) {
  $scope.activities = activities;
  ActivitiesService.data = $scope.activities;
});
angular.module('mean.icu.ui.detailsComponents').controller('OfficeDocumentsController', function($scope, entity, context, documents, AttachmentsService) {
  $scope.documents = documents;
});
angular.module('mean.icu.ui.detailsComponents').controller('OfficeTasksController', function($scope, entity, context, tasks, $state) {
  $scope.tasks = tasks;
});
angular.module('mean.icu.ui.detailsComponents').controller('OfficeFoldersController', function($scope, entity, context, folders, $state) {
  $scope.folders = folders;
});
angular.module('mean.icu.ui.detailsComponents').controller('OfficeSignaturesController', function($scope, entity, context, signatures, $state) {
  $scope.signatures = signatures;
});

angular.module('mean.icu.ui.detailsComponents').controller('OfficeDocumentActivitiesController', function($scope, entity, context, activities, ActivitiesService) {
  $scope.activities = activities;
  ActivitiesService.data = $scope.activities;
});
angular.module('mean.icu.ui.detailsComponents').controller('OfficeDocumentDocumentsController', function($scope, entity, context, documents, AttachmentsService) {
  $scope.documents = documents;
  $scope.documents.map(doc => AttachmentsService.getAttachmentUser(doc.creator)
      .then(user =>
          doc.attUser = user.name 
  ))
});


angular.module('mean.icu.ui.detailsComponents').controller('TemplateDocActivitiesController', function($scope, entity, context, activities, ActivitiesService) {
  $scope.activities = activities;
});
angular.module('mean.icu.ui.detailsComponents').controller('TemplateDocDocumentsController', function($scope, entity, context, documents) {
  $scope.documents = documents;
});
angular.module('mean.icu.ui.detailsComponents').controller('TemplateDocFoldersController', function($scope, entity, context, folders, $state) {
  $scope.folders = folders;
});