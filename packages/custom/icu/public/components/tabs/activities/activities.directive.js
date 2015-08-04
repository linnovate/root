'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsActivities', function() {
        function controller($scope, UsersService, context, DocumentsService, ActivitiesService) {
            $scope.activity = {
                description: ''
            };

            $scope.details = {
                createTask: 'create this task',
                createProject: 'create this task',
                document: 'add document',
                comment: 'add comment'
            }

            UsersService.getMe().then(function(user) {
                $scope.me = user;
                $scope.activity.user = user;
            });

            $scope.upload = function(files) {
                $scope.attachments = files;
            };

            $scope.save = function() {
                $scope.activity.issue = context.main.slice(0, -1);
                $scope.activity.issueId = $scope.entity._id;
                $scope.activity.type = $scope.attachments ? 'document' : 'comment';
                ActivitiesService.create($scope.activity).then(function(result) {
                    if ($scope.attachments && $scope.attachments.length) {
                        var file = $scope.attachments;
                        var data = {
                            issueId: result._id,
                            issue: 'update'
                        };
                        DocumentsService.saveAttachments(data, file);
                    }
                });
            };
        }

        return {
            restrict: 'A',
            scope: {
                activities: '=',
                entity: '='
            },
            replace: true,
            controller: controller,
            templateUrl: '/icu/components/tabs/activities/activities.html'
        };
    });