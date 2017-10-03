
function controllerTemplate($scope, $uibModalInstance, $filter, templates) {

    $scope.officeTemplates = templates;
    
    $scope.ok = function (sendingForm) {
        
       // OfficeDocumentsService.sendDocument(sendingForm, $scope.officeDocument)    
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

