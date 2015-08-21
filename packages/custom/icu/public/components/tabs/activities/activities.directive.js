'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsActivities', function () {
        function controller($scope, UsersService, context, DocumentsService, ActivitiesService) {
            $scope.activity = {
                description: ''
            };

            $scope.details = {
                create: 'created this ',
                update: 'updated this ',
                document: 'add document',
                comment: 'add comment'
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
                $scope.activity.description = '';
            };

            $scope.save = function () {
                $scope.activity.issue = $scope.entityName;
                $scope.activity.issueId = $scope.entity._id;
                $scope.activity.type = $scope.attachments ? 'document' : 'comment';
                ActivitiesService.create($scope.activity).then(function (result) {
                    if (!_.isEmpty($scope.attachments)) {
                        var file = $scope.attachments;
                        var data = {
                            issueId: result._id,
                            issue: 'update'
                        };
                        DocumentsService.saveAttachments(data, file);
                    }
                    clearForm();
                });
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
            templateUrl: '/icu/components/tabs/activities/activities.html'
        };
    });
