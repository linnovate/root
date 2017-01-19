'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsActivities', function() {
        function controller($scope, UsersService, DocumentsService, ActivitiesService, $stateParams, $state, $timeout, context, $http, FilesService) {
            $scope.isLoading = true;
            $scope.activity = {
                description: ''
            };

            $scope.context = context;
            $scope.stateParams = $stateParams

            $scope.details = $scope.context.entityName !== 'my' ? {
                create: [{
                    type: 'text',
                    value: 'createdThis'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                update: [{
                    type: 'text',
                    value: 'updatedThis'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                document: [{
                    type: 'text',
                    value: 'addDocument'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                comment: [{
                    type: 'text',
                    value: 'addComment'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                assign: [{
                    type: 'text',
                    value: 'assignedUser'
                }, {
                    type: 'deepObject',
                    value: ['userObj', 'name'],
                    klass: "user-name"
                }, {
                    type: 'text',
                    value: 'toThis'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                unassign: [{
                    type: 'deepObject',
                    value: ['userObj', 'name'],
                    klass: "user-name"
                }, {
                    type: 'text',
                    value: 'unassign'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                copy: [{
                    type: 'text',
                    value: 'copiedThe'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'object',
                    value: 'issue'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'text',
                    value: 'fromtemplate'
                }],
                copyAttachment: [{
                    type: 'text',
                    value: 'copiedAttachment'
                }, {
                    type: 'object',
                    value: 'issue'
                }]
            } : {
                create: [{
                    type: 'text',
                    value: 'createdThe'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'object',
                    value: 'issue'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'deepObject',
                    value: ['issueId', 'title'],
                    klass: "user-name"
                }],
                update: [{
                    type: 'text',
                    value: 'updatedThis'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                document: [{
                    type: 'text',
                    value: 'addDocument'
                }, {
                    type: 'object',
                    value: 'issue'
                }, {
                    type: 'deepObject',
                    value: ['issueId', 'title'],
                    klass: "user-name"
                }],
                comment: [{
                    type: 'text',
                    value: 'addComment'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                assign: [{
                    type: 'text',
                    value: 'assignedUser'
                }, {
                    type: 'deepObject',
                    value: ['userObj', 'name'],
                    klass: "user-name"
                }, {
                    type: 'text',
                    value: 'toThis'
                }, {
                    type: 'object',
                    value: 'issue'
                }, {
                    type: 'deepObject',
                    value: ['issueId', 'title'],
                    klass: "user-name"
                }],
                unassign: [{
                    type: 'deepObject',
                    value: ['userObj', 'name'],
                    klass: "user-name"
                }, {
                    type: 'text',
                    value: 'unassign'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'object',
                    value: 'issue'
                }],
                copy: [{
                    type: 'text',
                    value: 'copiedThe'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'object',
                    value: 'issue'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'deepObject',
                    value: ['issueId', 'title'],
                    klass: "user-name"
                }, {
                    type: 'text',
                    value: 'fromtemplate'
                }],
                copyAttachment: [{
                    type: 'text',
                    value: 'copiedAttachment'
                }, {
                    type: 'object',
                    value: 'issue'
                }, {
                    type: 'nbsp'
                }, {
                    type: 'deepObject',
                    value: ['issueId', 'title'],
                    klass: "user-name"
                }]
            };

            UsersService.getMe().then(function(user) {
                $scope.me = user;
                $scope.activity.user = user;
            });

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
                console.log('activity', $scope.activity, 'context', context);

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

                        DocumentsService.saveAttachments(data, file).success(function(attachment) {
                            result.attachments = [attachment];
                        });
                    }
                    //clearForm();
                    console.log('result', result);
                    $scope.activities.push(result);
                    clearForm();
                });
            };

            $timeout(function() {
                $scope.isLoading = false;
            }, 0);


            // Made BY OHAD

            $scope.isOpen = {};
            $scope.trigger = function(document) {
                $scope.isOpen[document._id] = !$scope.isOpen[document._id];
            };
            $scope.view = function(document1) {
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
                    }).success(function() {
                        // There is allready the convert file
                        window.open(ToHref + '?view=true')
                    }).error(function() {
                        // Send to server
                        $.post('/append.js', document1).done(function(document2) {
                            // The convert is OK and now we open the pdf to the client in new window
                            window.open(ToHref + '?view=true');
                        }).fail(function(xhr) {
                            console.error(xhr.responseText);
                        });
                    });
                }
                // Format is NOT needed to view as pdf
                else {
                    window.open(document1.path + '?view=true');
                }
            };

            // END Made By OHAD
        }


        function link($scope, $element) {
            var activityList = $element.find('.activities-list');
            var addUpdateField = $element.find('.add-update textarea');

            $scope.expandUpdate = function() {
                if (addUpdateField.height() < 150) {
                    addUpdateField.css("height", "100px");
                    activityList.css("height", "calc(100% - 170px)");
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