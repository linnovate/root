'use strict';

angular.module('mean.icu.ui.projectdetails').controller('ProjectPolicyController', ProjectPolicyController);

function ProjectPolicyController($scope, $uibModalInstance, item, template, me, people) {

  $scope.item = item;
  $scope.template = template;
  $scope.me = me;
  $scope.people = people;
  $scope.selectedTemplates = [];
  $scope.item.templates = $scope.item.templates || [];

  var selectedTemplate = $scope.template.find(t => t._id === $scope.item.templates[0]);
  if (selectedTemplate) $scope.selectedTemplates = [selectedTemplate];

  $scope.ok = function() {
    $uibModalInstance.close($scope.selectedTemplates.map(t => t._id));
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.implementTemplate = function(templateId) {
    // $scope.selectedTemplates.push($scope.template.find(t => t._id === templateId));
    $scope.selectedTemplates = [$scope.template.find(t => t._id === templateId)];
  };
}
