'use strict';

angular.module('mean.icu.ui.discussioncreate', [])
.controller('DiscussionCreateController', function($scope, $state, DiscussionsService, context) {
    $scope.discussion = {
        name: 'discussion'
    };

    $scope.create = function() {
        DiscussionsService.create($scope.discussion).then(function(result) {

            $scope.closeThisDialog();

            context.switchTo('discussion', result._id).then(function(newContext) {
                $state.go('main.tasks.byentity', {
                    id: result._id,
                    entity: newContext.entityName,
                    entityId: newContext.entityId
                }, {reload: true});
            });
        });
    };
});
