'use strict';

angular.module('mean.icu.ui.discussioncreate', [])
.controller('DiscussionCreateController', function($scope, $state, DiscussionsService, context) {
    $scope.discussion = {
        name: 'discussion'
    };

    $scope.create = function() {
        DiscussionsService.create($scope.discussion).then(function(result) {

            $scope.closeThisDialog();

            $state.go('main.tasks.byentity', {
                id: result._id,
                entity: 'discussion',
                entityId: result._id
            }, {reload: true});
        });
    };
});
