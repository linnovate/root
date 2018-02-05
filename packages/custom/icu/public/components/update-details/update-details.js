'use strict';

angular.module('mean.icu.ui.attachmentdetails', [])
    .controller('AttachmentDetailsController', function ($scope,
                                                        $http,
                                                         entity,
                                                         tasks,
                                                         context,
                                                         $state,
                                                         DocumentsService,
                                                         $stateParams) {
        $scope.update = entity || context.entity;
        $scope.tasks = tasks;
        $scope.shouldAutofocus = !$stateParams.nameFocused;
        $scope.attachment = entity ;

        $scope.$watchGroup(['update.description', 'update.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.update);
            }
        });

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        function navigateToDetails(update) {
            $scope.detailsState = 'main.search.update';

            $state.go($scope.detailsState, {
                id: update._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (update) {
            DocumentsService.star(update).then(function () {
                navigateToDetails(update);
            });
        };
          
        $scope.viewAttachment = function (document1) { 
                        return(document1.path + '?view=true') ;      

                        }

        $scope.deleteUpdate = function (update) {
            DocumentsService.remove(update._id).then(function () {
                $state.reload();
            });
        };

        $scope.update = function (update) {
            DocumentsService.update(update);
        };

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.update && $state.current.name === 'main.search.update') {
            $state.go('.versions');
        }
    });
