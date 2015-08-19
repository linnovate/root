'use strict';

angular.module('mean.icu.ui.discussionlistdirective', [])
.directive('icuDiscussionList', function () {
    function controller($scope, context, DiscussionsService, $state) {
        $scope.context = context;

        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        _($scope.discussions).each(function(d) {
            d.__state = creatingStatuses.created;
        });

        $scope.discussions.push({
            title: '',
            watchers: [],
            __state: creatingStatuses.NotCreated
        });

        $scope.isCurrentState = function (id) {
            return ($state.current.name.indexOf('main.discussions.byentity.details') === 0 ||
                    $state.current.name.indexOf('main.discussions.all.details') === 0
                ) && $state.params.id === id;
        };

        $scope.initialize = function(discussion) {
            if (discussion.__state !== creatingStatuses.NotCreated) {
                $scope.createOrUpdate(discussion).then(function() {
                    $state.go($scope.detailsState, {
                        id: discussion._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            } else {
                $state.go($scope.detailsState, {
                    id: discussion._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            }
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

        $scope.createOrUpdate = function (discussion) {
            if (discussion.__state === creatingStatuses.NotCreated) {
                discussion.__state = creatingStatuses.Creating;
                return DiscussionsService.create(discussion).then(function (result) {
                    discussion.__state = creatingStatuses.Created;
                    discussion._id = result._id;
                });
            } else if (discussion.__state === creatingStatuses.Created) {
                return DiscussionsService.update(discussion);
            }
        };
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/discussion-list-directive/discussion-list.directive.template.html',
        scope: {
            discussions: '=',
            drawArrow: '=',
            groupDiscussions: '=',
            order: '='
        },
        controller: controller
    };
});
