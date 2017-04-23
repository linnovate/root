'use strict';

angular.module('mean.icu.ui.attachmentdetails', [])
    .controller('AttachmentDetailsController', function ($scope,
                                                         entity,
                                                         tasks,
                                                         context,
                                                         $state,
                                                         DocumentsService,
                                                         $stateParams) {
        $scope.attachment = entity || context.entity;
        $scope.tasks = tasks;
        $scope.shouldAutofocus = !$stateParams.nameFocused;

        $scope.$watchGroup(['attachment.description', 'attachment.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.attachment);
            }
        });

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        function navigateToDetails(attachment) {
            $scope.detailsState = 'main.search.attachment';

            $state.go($scope.detailsState, {
                id: attachment._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (attachment) {
            DocumentsService.star(attachment).then(function () {
                navigateToDetails(attachment);
            });
        };

        $scope.deleteAttachment = function (attachment) {
            DocumentsService.remove(attachment._id).then(function () {
                $state.reload();
            });
        };

        $scope.update = function (attachment) {
            DocumentsService.update(attachment);
        };

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.attachment && $state.current.name === 'main.search.attachment') {
            $state.go('.versions');
        }
    });
