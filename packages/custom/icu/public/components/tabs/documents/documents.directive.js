'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsDocuments', function () {
        function controller($scope, $http, DocumentsService, context, ActivitiesService, $stateParams, UsersService, AttachmentsService) {
            
            ActivitiesService.issueId=$stateParams.id || $stateParams.entityId;
            
            $scope.stateParams = $stateParams;
            
            ActivitiesService.issue = $scope.entityName;
            $scope.context = context;
            $scope.isOpen = {};
            $scope.activity = {
                description: ''
            };

            $scope.upload = function(files) {
                $scope.attachments = files;
            };

            var clearForm = function() {
                $scope.attachments = [];
                $scope.activity = {
                    description: ''
                };
            };

            $scope.save = function() {
                console.log('activity', $scope.activity, 'context', context);
                if (_.isEmpty($scope.attachments) && _.isEmpty($scope.activity.description)) return;
                $scope.activity.issue = $scope.entityName;
                $scope.activity.issueId = $stateParams.id || $stateParams.entityId;
                $scope.activity.type = $scope.attachments && $scope.attachments.length ? 'document' : 'comment';

                // $scope.activity.size = $scope.attachments[0].size;

                var isRoomProject = $scope.entityName === 'project',
                    isRoomFortask = $scope.entityName === 'task' && $scope.entity.project,
                    context = {};

                if (isRoomProject || isRoomFortask) { //for notification in hi
                    context = {
                        room: isRoomProject ? $scope.entity.room : $scope.entity.project.room,
                        action: 'added',
                        type: $scope.activity.type,
                        description: $scope.activity.description,
                        issue: $scope.activity.issue,
                        issueName: $scope.entity.title,
                        name: !_.isEmpty($scope.attachments) ? $scope.attachments[0].name : '',
                        location: location.href
                    }
                }

                ActivitiesService.create({
                    data: $scope.activity,
                    context: context
                }).then(function(result) {
                    if (!_.isEmpty($scope.attachments)) {
                        var file = $scope.attachments;
                        var data = {
                            issueId: result._id,
                            issue: 'update',
                            entity: $scope.entityName,
                            entityId: $stateParams.id || $stateParams.entityId
                        };
                        console.log('if data', data);
                        console.log('if file', file);

                        result.attachments = [];

                        for (var index = 0; index < file.length; index++) {

                            DocumentsService.saveAttachments(data, file[index]).success(function(attachment) {
                                console.log('[attachment]', [attachment]);
                                
                                result.attachments[result.attachments.length] = attachment;

                                AttachmentsService.getAttachmentUser(attachment).then(user => {
                                    attachment.attUser = user.name ;
                                    $scope.documents.push(attachment);
                                }
                                )                        
                                
                            });
                        }
                    }
                    //clearForm();
                    console.log('result', result);
                    //$scope.documents.push(result);
                    clearForm();
                });
            };


            $scope.trigger = function (document) {
                $scope.isOpen[document._id] = !$scope.isOpen[document._id];
            };
            $scope.view = function (document1) {

                // Check if need to view as pdf   
                if ((document1.attachmentType == "docx") ||
                    (document1.attachmentType == "doc") ||
                    (document1.attachmentType == "xlsx") ||
                    (document1.attachmentType == "xls") ||
                    (document1.attachmentType == "ppt") ||
                    (document1.attachmentType == "pptx")) {
                    var arr = document1.path.split("." + document1.attachmentType);
                    var ToHref = arr[0] + ".pdf";
                    // Check if convert file exists allready
                    $http({
                        url: ToHref.replace('/files/', '/api/files/'),
                        method: 'HEAD'
                    }).success(function () {
                        // There is allready the convert file
                        window.open(ToHref + '?view=true')
                    }).error(function () {
                        // Send to server
                        $.post('/append.js', document1).done(function (document2) {
                            // The convert is OK and now we open the pdf to the client in new window
                            window.open(ToHref + '?view=true');
                        }).fail(function (xhr) {
                            console.error(xhr.responseText);
                        });
                    });
                }
                // Format is NOT needed to view as pdf
                else {
                    window.open(document1.path + '?view=true');
                }
            };
            $scope.remove = function (file, index) {
                DocumentsService.delete(file._id).then(function (status) {
                    if (status == 200) {
                        $scope.documents.splice(index, 1);
                        ActivitiesService.create({
                          data: {
                              issue: ActivitiesService.issue,
                              issueId: ActivitiesService.issueId,
                              type: 'documentDelete',
                              description: ''
                          },
                          context: {}
                        })
                    }
                });

            };

            $scope.autoFormatFilesize = function (fileSize) {
                if (fileSize > 1000000000) {
                    return (fileSize / 1000000000.0)
                        .toPrecision(3) + " GB";
                } else if (fileSize > 1000000) {
                    return (fileSize / 1000000.0)
                        .toPrecision(3) + " MB";
                } else if (fileSize > 1000) {
                    return (fileSize / 1000.0)
                        .toPrecision(3) + " KB";
                } else if (fileSize % 1 != 0) {
                    return fileSize + " MB"
                } else {
                    return fileSize + " bytes"
                }
            }
        }

        return {
            restrict: 'A',
            scope: {
                documents: '=',
                entity: '=',
                entityName: '@'
            },
            replace: true,
            controller: controller,
            templateUrl: '/icu/components/tabs/documents/documents.html'
        };
    });