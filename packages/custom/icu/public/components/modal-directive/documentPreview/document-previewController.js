function controllerDocumentPreview($scope, $uibModalInstance, attachment, $filter,$http, UsersService,AttachmentsService) {

    $scope.path = "" ;

    $scope.getPath = function () { 
//        console.log("$scope.getPath",$scope.path) ;  
        return $scope.path ;
    }

    $scope.getAttachment = function () {  
        //        console.log("$scope.getPath",$scope.path) ;  
                return attachment ;
    }
    $scope.attachment = attachment ;

    $scope.attName =  attachment.name ;
    $scope.attCreated =  attachment.created ; 
    $scope.attSize =  attachment.size ;
    $scope.attCreator = null ; 
    UsersService.getById(attachment.creator).then(user => $scope.attCreator = user.name) ;

    $scope.attPath =  attachment.path ;  
    $scope.attPrint =  attachment.size ;
    $scope.attType =  attachment.attachmentType;
                
    $scope.previewWindow = function(document) {
        AttachmentsService.previewWindow(document) ;
    }       


    $scope.previewAttachment = function () { 

        
        attachment.documentType = attachment.attachmentType ? attachment.attachmentType : attachment.documentType ;
         var resPath = myTest(attachment) ;
//         console.log("resPath",resPath) ;
         return resPath ;
    }

    $scope.previewAttachment() ; 

    function myTest(document1) {
        // Check if need to view as pdf
        if ((document1.documentType == "docx") ||
            (document1.documentType == "doc") ||
            (document1.documentType == "xlsx") ||
            (document1.documentType == "xls") ||
            (document1.documentType == "ppt") ||
            (document1.documentType == "pptx")) {
            var arr = document1.path.split("." + document1.documentType);
            var ToHref = arr[0] + ".pdf";
            // Check if convert file exists allready
            // console.log("ToHref", ToHref);
            $http({
                url: ToHref.replace('/files/', '/api/files/'),
                method: 'HEAD'
            }).success(function() {
                // There is allready the convert file
                $scope.path = ToHref + '?view=true' ;
            }).error(function() {
                // Send to server
                $.post('/officeDocsAppend.js', document1).done(function(document2) {
                    // The convert is OK and now we open the pdf to the client in new window
                    $scope.path = ToHref + '?view=true' ;
                }).fail(function(xhr) {
                    console.error(xhr.responseText);
                });
            });
        }
        // Format is NOT needed to view as pdf
        else {
            console.log("// Format is NOT needed to view as pdf") ;
            $scope.path = document1.path + '?view=true' ;
        }
    }
    
    $scope.ok = function (sendingForm) {
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}