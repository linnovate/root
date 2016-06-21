'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsActivities', function () {
        function controller($scope, UsersService, DocumentsService, ActivitiesService, $stateParams, $state, $timeout) {
            $scope.isLoading = true;
            $scope.activity = {
                description: ''
            };

            $scope.details = {
                create: 'createdThis',
                update: 'updatedThis',
                document: 'addDocument',
                comment: 'addComment'
            };

            UsersService.getMe().then(function (user) {
                $scope.me = user;
                $scope.activity.user = user;
            });

            $scope.upload = function (files) {
                $scope.attachments = files;
            };

            var clearForm = function () {
                $scope.attachments = [];
                $scope.activity = {
                    description: ''
                };
            };

            $scope.save = function () {
                $scope.activity.issue = $scope.entityName;
                $scope.activity.issueId = $stateParams.id || $stateParams.entityId;
                $scope.activity.type = $scope.attachments ? 'document' : 'comment';

                var isRoomProject = $scope.entityName === 'project' && $scope.entity.room,
                    isRoomFortask = $scope.entityName === 'task' && $scope.entity.project && $scope.entity.project.room,
                    context = {};

                if(isRoomProject || isRoomFortask) { //for notification in hi
                    context = {
                        room: isRoomProject ? $scope.entity.room : $scope.entity.project.room,
                        action:'added',
                        type: $scope.activity.type,
                        description: $scope.activity.description,
                        issue: $scope.activity.issue,
                        issueName: $scope.entity.title,
                        name: !_.isEmpty($scope.attachments) ? $scope.attachments[0].name : ''
                    }
                }

                ActivitiesService.create({data:$scope.activity, context:context}).then(function (result) {
                    if (!_.isEmpty($scope.attachments)) {
                        var file = $scope.attachments;
                        var data = {
                            issueId: result._id,
                            issue: 'update',
                            entity: $scope.entityName,
                            entityId: $stateParams.id || $stateParams.entityId
                        };

                        DocumentsService.saveAttachments(data, file).success(function(attachment) {
                            result.attachments.push(attachment);
                        });
                    }
                    clearForm();
                    $scope.activities.push(result);
                });
            };

            $timeout(function() {
                $scope.isLoading = false;
            }, 0);
            
            
            // Made BY OHAD
            
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
            
            // END Made By OHAD
        }


        function link($scope, $element) {
            var activityList = $element.find('.activities-list');
            var addUpdateField = $element.find('.add-update textarea');

            $scope.expandUpdate = function() {
                if (addUpdateField.height() < 150) {
                    addUpdateField.css("height", "130px");
                    activityList.css("height", "calc(100% - 200px)");
                }
            };
            $scope.minimizeUpdate = function() {
                addUpdateField.css("height", "50px");
                activityList.css("height", "calc(100% - 120px)");

            };
        }

        return {
            restrict: 'A',
            scope: {
                activities: '=',
                entity: '=',
                entityName: '@'
            },
            replace: true,
            controller: controller,
            link: link,
            templateUrl: '/icu/components/tabs/activities/activities.html'
        };
    });
