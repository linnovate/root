'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsActivities', function () {
        function controller($scope, UsersService, context, DocumentsService) {
            $scope.activity = {
                description: ''
            };

            UsersService.getMe().then(function (user) {
                $scope.me = user;
                $scope.activity.user = user;
            });

            $scope.upload = function (files) {
                $scope.activity.attachments = files;

                if (files && files.length) {
                    for (var i = 0; i < files.length; i += 1) {
                        var file = files[i];
                        var data = {
                            issue: context.main.slice(0, -1),
                            issueId: $scope.entity._id,
                            name: file.name,
                            path: file.name
                        };

                        DocumentsService.saveAttachments(data, file);
                    }
                }
            };

            $scope.save = function () {
                // save all activity
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
