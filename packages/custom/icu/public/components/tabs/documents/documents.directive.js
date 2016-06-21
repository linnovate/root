'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsDocuments', function () {
        function controller($scope) {
            $scope.isOpen = {};
            $scope.trigger = function (document) {
                $scope.isOpen[document._id] = !$scope.isOpen[document._id];
            };
            $scope.view = function (document1) {
                
             // Check if need to view as pdf   
             if((document1.attachmentType == "docx") ||
                (document1.attachmentType == "doc") ||
                (document1.attachmentType == "xlsx") ||
                (document1.attachmentType == "xls") ||
                (document1.attachmentType == "ppt") ||
                (document1.attachmentType == "pptx"))
                {
            
        
                    var arr = document1.path.split("." + document1.attachmentType);
                    var ToHref = arr[0] + ".pdf";
                    
                    $.ajax({
                        url:ToHref,
                        type: 'HEAD',
                        // Check if convert file exists allready
                        error: function () {
                            
                            // Send to server
                            $.post('/append.js', document1).done(function (document2) {
                                // The convert is OK and now we open the pdf to the client in new window
                                window.open(ToHref);
                            }).fail(function(xhr)
                            {
                                console.error(xhr.responseText);
                            });
                        },
                        // There is allready the convert file
                        success: function () {
                            window.open(ToHref);
                        }
                    });
                }
                // Format is NOT needed to view as pdf
                else
                {
                    window.open(document1.path);
                }
            };
        }

        return {
            restrict: 'A',
            scope: {
                documents: '='
            },
            replace: true,
            controller: controller,
            templateUrl: '/icu/components/tabs/documents/documents.html'
        };
    });