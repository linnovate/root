
function controllerTemplate($scope, $uibModalInstance, $filter, templates, $state) {

    $scope.officeTemplates = templates;
    
    $scope.ok = function (sendingForm) {
        
       // OfficeDocumentsService.sendDocument(sendingForm, $scope.officeDocument)    
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.GoToTemplateDocs = function () {
        $scope.cancel();
        $state.go('main.templateDocs.all');
    }
}

