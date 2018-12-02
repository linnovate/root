'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsDocuments', function () {
        function controller($scope, $http,  $state, $stateParams, DocumentsService, context, ActivitiesService, UsersService, AttachmentsService, PermissionsService) {

            ActivitiesService.entity=$stateParams.id || $stateParams.entityId;

            $scope.stateParams = $stateParams;

            ActivitiesService.entityType = $scope.entityName;
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

            if($scope.entity)$scope.isRecycled = $scope.entity.hasOwnProperty('recycled');

            $scope.havePermissions = function(type){
                if($scope.entity)return (PermissionsService.havePermissions($scope.entity, type) && !$scope.isRecycled);
            };

            $scope.save = function() {
                if (_.isEmpty($scope.attachments)) return;
                $scope.activity.entityType = $scope.entityName;
                $scope.activity.entity = $stateParams.id || $stateParams.entityId;
                $scope.activity.updateField = $scope.attachments && $scope.attachments.length ? 'attachment' : 'comment';

                // $scope.activity.size = $scope.attachments[0].size;

                var isRoomProject = $scope.entityName === 'project',
                    isRoomFortask = $scope.entityName === 'task' && $scope.entity.project,
                    context = {};

                if (isRoomProject || isRoomFortask) { //for notification in hi
                    context = {
                        room: isRoomProject ? $scope.entity.room : $scope.entity.project.room,
                        action: 'added',
                        updateField: $scope.activity.updateField,
                        issue: $scope.activity.entityType,
                        issueName: $scope.entity.title,
                        name: !_.isEmpty($scope.attachments) ? $scope.attachments[0].name : '',
                        location: location.href
                    }
                }

                ActivitiesService.create({
                    data: {
                        creator: $scope.me,
                        date: new Date(),
                        entity: $scope.entity._id,
                        entityType: $scope.entityName,

                        updateField: 'attachment',
                        current: $scope.activity,
                    },
                    context: {}
                }).then(function(result) {
                    if (!_.isEmpty($scope.attachments)) {
                        var file = $scope.attachments;
                        var data = {
                            issueId: result._id,
                            issue: 'update',
                            entity: $scope.entityName,
                            entityId: $stateParams.id || $stateParams.entityId
                        };

                        result.attachments = [];

                        for (var index = 0; index < file.length; index++) {

                            DocumentsService.saveAttachments(data, file[index])
                                .then(function(attachment) {
                                    console.log('[attachment]', [attachment]);

                                    result.attachments[result.attachments.length] = attachment;
                                    AttachmentsService.getAttachmentUser(result.creator._id)
                                        .then(user => {
                                            result.attUser = user.name ;
                                            $scope.documents.push(result);
                                        })
                                });
                        }
                    }
                    clearForm();
                });
            };

        $scope.trigger = function (document) {
            $scope.isOpen[document._id] = !$scope.isOpen[document._id];
        };

        $scope.download = function(path){
            var newPath = path.substring(path.indexOf('/files'),path.length);
             newPath = newPath.replace(/\//g, '%2f');
            DocumentsService.getFileFtp(newPath).then(function(){

            });
        }

        $scope.view = function (document1) {

            // Check if need to view as pdf
            if (document1.attachmentType == "docx" || document1.attachmentType == "doc" || document1.attachmentType == "xlsx" || document1.attachmentType == "xls" || document1.attachmentType == "ppt" || document1.attachmentType == "pptx") {
                var arr = document1.path.split("." + document1.attachmentType);
                var ToHref = arr[0] + ".pdf";
                // Check if convert file exists allready
                $http({
                    url: ToHref.replace('/files/', '/api/files/'),
                    method: 'HEAD'
                }).success(function () {
                    // There is allready the convert file
                    window.open(ToHref + '?view=true');
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

            $scope.checkAttachmentCreator = doc => {
                let havePerms = $scope.havePermissions('tab-content'),
                  commenterAndCreator = (me) => {
                    let creatorId = doc.creator._id || doc.creator;
                    return havePerms && (creatorId === me._id)
                  },
                  isEditor = (user) => PermissionsService.getPermissionStatus(user, $scope.entity) === 'editor';


                if(!$scope.me){
                    UsersService.getMe().then( me => {
                        $scope.me = me;
                        return commenterAndCreator($scope.me) || isEditor(me);
                    });
                } else return commenterAndCreator($scope.me) || isEditor($scope.me);
            };

            $scope.remove = function (file, index) {
                // if(!$scope.checkAttachmentCreator(file))return;
                let currentEntity = $state.current.name.split('.')[1];
                let parent = currentEntity.slice(0, currentEntity.length-1);

                if(parent === 'folder') parent = 'folders';

                DocumentsService.delete(file._id, {parent: parent, id: $scope.entity._id})
                  .then(function (status) {
                    if (status === 200) {
                        ActivitiesService.create({
                            data: {
                                creator: $scope.me,
                                date: new Date(),
                                entity: ActivitiesService.entity,
                                entityType: ActivitiesService.entityType,

                                updateField: 'attachment',
                            },
                            context: {}
                        })
                    }
                  })
                  .then( () => $scope.documents.splice(index, 1))
                  .catch( err => console.log(err));
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
