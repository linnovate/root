'use strict';

angular.module('mean.icu.ui.discussionlist', [])
.directive('icuDiscussionList', function () {
    function controller($scope, context, DiscussionsService, $state) {
        $scope.context = context;

        $scope.isCurrentState = function (id) {
            return ($state.current.name.indexOf('main.discussions.byentity.details') === 0 ||
                    $state.current.name.indexOf('main.discussions.all.details') === 0
                ) && $state.params.id === id;
        };


        $scope.showDetails = function (discussion) {
            if (context.entityName === 'all') {
                $state.go('main.discussions.all.details', {
                    id: discussion._id
                });
            } else {
                $state.go('main.discussions.byentity.details', {
                    id: discussion._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            }
        };

        $scope.newDiscussion = DiscussionsService.getNew(context.entityId);

        $scope.update = _.debounce(function (discussion) {
            DiscussionsService.update(discussion);
        }, 300);

        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        var created = creatingStatuses.NotCreated;

        $scope.createOrUpdate = function (discussion) {
            if (created === creatingStatuses.NotCreated) {
                created = creatingStatuses.Creating;
                DiscussionsService.create(discussion).then(function (result) {
                    created = creatingStatuses.Created;
                    discussion._id = result._id;
                });
            } else if (created === creatingStatuses.Created) {
                DiscussionsService.update(discussion);
            }
        };
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/discussion-list/discussion-list.directive.template.html',
        scope: {
            discussions: '=',
            drawArrow: '=',
            groupDiscussions: '=',
            order: '='
        },
        controller: controller
    };
});
