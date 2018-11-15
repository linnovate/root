'use strict';

angular.module('mean.icu.ui.inbox', [])
.controller('InboxListController',
    function ($scope, $state, $stateParams, me, people, activities, updatedEntities, InboxService) {
        $scope.me = me;
        $scope.activities = updatedEntities.activities;
        $scope.entities = updatedEntities.entities;
        $scope.users = updatedEntities.users;
        $scope.inboxState = 'main.inbox';

        $scope.getActivityDescription = InboxService.getActivityDescription;

        $scope.getParent = activity => {
            let entityObj = activity.entityObj;
            let parent = entityObj.project || entityObj.folder || entityObj.office;

            if(parent){
                activity.parent = parent.title;
                activity.parentColor = parent.color;
            }
        };

        $scope.formatDate = date => moment(date).format('HH:mm | DD/MM/YYYY');

        $scope.initiate = function($event, entity, activityType) {
            $state.go($scope.inboxState + '.' + activityType + '.activities', {
                id: entity._id,
                entity: activityType,
                entityId: entity._id
            });
        };

        $scope.loadNext = activities.next;
        $scope.loadPrev = activities.prev;

        $scope.loadMore = function() {
            let LIMIT = 25;
            let loadedCount = 0;
            let listEnd = false;

            loadedCheck(listEnd, loadedCount);

            function loadedCheck(listEnd, loadedCount) {
                if (loadedCount < 25 && !listEnd) {
                    let START = $scope.activities.length;

                    loadData(START, LIMIT)
                        .then(result => {
                            if (result.length === 0) listEnd = true;
                            loadedCount += result.length;
                            loadedCheck(listEnd, loadedCount);
                        })
                }
            }
        };

        function loadData (START, LIMIT) {
            return new Promise((resolve) => {
                if ($scope.loadNext) {
                    return $scope.loadNext()
                        .then(function (items) {
                            let offset = $scope.displayOnly ? 0 : 1;

                            if (items.data.length) {
                                let index = $scope.activities.length - offset;
                                let args = [index, 0].concat(items.data);

                                [].splice.apply($scope.activities, args);
                            }

                            $scope.loadNext = items.next;
                            $scope.loadPrev = items.prev;

                            return resolve(items.data);
                        });
                }
                return resolve([]);
            })
        }
    });
