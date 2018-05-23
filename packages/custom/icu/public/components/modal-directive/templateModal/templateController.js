
function controllerTemplate($scope, $uibModalInstance, $filter, templates,$state,  OfficeDocumentsService) {

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

    $scope.uploadOfficeDocumentFromTemplate = function(template){
        template.isUploaded = true;
        OfficeDocumentsService.uploadDocumentFromTemplate(template,$scope.$resolve.officeDocument).then(function(result){
            $scope.$resolve.officeDocument.path = result.path;
            $scope.$resolve.officeDocument.title = result.title;
            $scope.$resolve.officeDocument.documentType = result.documentType;
            if(result.spPath){
                $scope.$resolve.officeDocument.spPath = result.spPath;
            }
            template.isUploaded = false;
            $scope.cancel();


        });

    };
}

