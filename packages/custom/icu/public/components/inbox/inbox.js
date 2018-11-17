'use strict';

angular.module('mean.icu.ui.inbox', [])
.controller('InboxListController',
    function ($scope, $state, $stateParams, me, people, activities, updatedEntities, InboxService, ActivitiesService) {
        $scope.me = me;
        $scope.activities = updatedEntities.activities;
        $scope.entities = updatedEntities.entities;
        $scope.users = updatedEntities.users;
        $scope.inboxState = 'main.inbox';
        $scope.loadNext = ActivitiesService.getByUserId;

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

        $scope.debouncedLoadMore = _.debounce(loadMore, 300);

        function loadMore(){
            let START = $scope.activities.length;
            let LIMIT = 25;

            loadData(START, LIMIT)
        }

        function loadData (START, LIMIT) {
            return $scope.loadNext(me._id, START, LIMIT, 'created')
                .then( items => {
                    if(!items)return;
                    return InboxService.getUpdateEntities(items)
                })
                .then(updatedActivities => {
                    if(!updatedActivities)return;

                    let items = updatedActivities.activities;
                    if (items.length) {
                        let index = $scope.activities.length;
                        let args = [index, 0].concat(items);

                        [].splice.apply($scope.activities, args);
                    }

                    return items;
                });
        }
    });
