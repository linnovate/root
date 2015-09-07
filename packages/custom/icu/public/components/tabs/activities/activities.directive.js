'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsActivities', function () {
        function controller($scope, UsersService, context, DocumentsService, ActivitiesService, $stateParams, $state) {
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
                $scope.activity.issue = $stateParams.id ? context.main.slice(0, -1) : context.entityName;
                $scope.activity.issueId = $stateParams.id || $stateParams.entityId;
                $scope.activity.type = $scope.attachments ? 'document' : 'comment';

                ActivitiesService.create($scope.activity).then(function (result) {
                    if (!_.isEmpty($scope.attachments)) {
                        var file = $scope.attachments;
                        var data = {
                            issueId: result._id,
                            issue: 'update',
                            entity: $stateParams.id ? context.main.slice(0, -1) : context.entityName,
                            entityId: $stateParams.id || $stateParams.entityId
                        };

                        DocumentsService.saveAttachments(data, file);
                    }
                    clearForm();
                });

                $state.reload($state.current.name);
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
