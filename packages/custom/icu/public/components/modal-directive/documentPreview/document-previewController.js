function controllerDocumentPreview(
  $scope,
  $uibModalInstance,
  attachment,
  $filter,
  $http,
  UsersService,
  AttachmentsService,
  DocumentsService
) {
  $scope.path = "";

  $scope.getPath = function() {
    return $scope.path;
  };

  $scope.getAttachment = function() {
    return attachment;
  };
  $scope.attachment = attachment;

  $scope.attName = attachment.name;
  $scope.attCreated = attachment.created;
  $scope.attSize = attachment.size;
  $scope.attCreator = null;
  UsersService.getById(attachment.creator).then(
    user => ($scope.attCreator = user.name)
  );

  $scope.attPath = attachment.path;
  $scope.attForFTPPath = $scope.attPath.substring(
    $scope.attPath.indexOf("/files"),
    $scope.attPath.length
  );
  $scope.attForFTPPath = $scope.attForFTPPath.replace(/\//g, "%2f");
  $scope.attPrint = attachment.size;
  $scope.attType = attachment.attachmentType;

  $scope.previewWindow = function(document1) {
    if (
      document1.documentType == "docx" ||
      document1.documentType == "doc" ||
      document1.documentType == "xlsx" ||
      document1.documentType == "xls" ||
      document1.documentType == "ppt" ||
      document1.documentType == "pptx"
    ) {
      var pdfPath = document1.path.replace("/files", "/preview");

      pdfPath = pdfPath.substring(
        pdfPath.indexOf("preview"),
        pdfPath.lastIndexOf(".")
      );
      pdfPath = pdfPath + ".pdf";
      pdfPath = pdfPath.replace(/\//g, "%2f");
      console.log(pdfPath);
      DocumentsService.viewFileLink(pdfPath).then(function(result) {
        window.open(result + "?view=true");
        console.dir($scope.path);
      });
    } else {
      var picPath = document1.path;

      picPath = picPath.substring(picPath.indexOf("files"), picPath.length);
      picPath = picPath.replace(/\//g, "%2f");
      DocumentsService.viewFileLink(picPath).then(function(result) {
        window.open(result + "?view=true");
      });
    }
  };

  $scope.previewAttachment = function() {
    attachment.documentType = attachment.attachmentType
      ? attachment.attachmentType
      : attachment.documentType;
    var resPath = myTest(attachment);
    return resPath;
  };

  $scope.previewAttachment();

  function myTest(document1) {
    if (
      document1.documentType == "docx" ||
      document1.documentType == "doc" ||
      document1.documentType == "xlsx" ||
      document1.documentType == "xls" ||
      document1.documentType == "ppt" ||
      document1.documentType == "pptx" ||
      document1.documentType == "tif"
    ) {
      var pdfPath = document1.path.replace("/files", "/preview");

      pdfPath = pdfPath.substring(
        pdfPath.indexOf("preview"),
        pdfPath.lastIndexOf(".")
      );
      pdfPath = pdfPath + ".pdf";
      pdfPath = pdfPath.replace(/\//g, "%2f");
      console.log(pdfPath);
      DocumentsService.viewFileLink(pdfPath, document1.documentType).then(
        function(result) {
          $scope.path = result + "?view=true";
        }
      );
    } else {
      var pdfPath = document1.path;

      pdfPath = pdfPath.substring(pdfPath.indexOf("files"), pdfPath.length);
      pdfPath = pdfPath.replace(/\//g, "%2f");
      DocumentsService.viewFileLink(pdfPath).then(function(result) {
        $scope.path = result + "?view=true";
      });
    }
  }

  /**
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
            $http({
                url: ToHref.replace('/files/', '/api/files/'),
                method: 'HEAD'
            }).success(function() {
                // There is allready the convert file
                $scope.path = ToHref + '?view=true' ;
            }).error(function() {
                // Send to server
                $http.post('/officeDocsAppend.js', document1)
                    .then(res => {
                        // The convert is OK and now we open the pdf to the client in new window
                        $scope.path = ToHref + '?view=true' ;
                    }).catch(err => {
                        console.error(err);
                    });
            });
        }
        // Format is NOT needed to view as pdf
        else {
            $scope.path = document1.path + '?view=true' ;
        }
    }
 */
  $scope.ok = function(sendingForm) {
    $uibModalInstance.dismiss("cancel");
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
}
