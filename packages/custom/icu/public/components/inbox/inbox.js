'use strict';

angular.module('mean.icu.ui.inbox', [])
.controller('InboxListController',
    function ($scope, $state, $stateParams, $i18next, me, activities, updatedEntities) {
        $scope.me = me;
        $scope.activities = updatedEntities.activities;
        $scope.entities = updatedEntities.entities;
        $scope.users = updatedEntities.users;
        $scope.inboxState = 'main.inbox';

        $scope.getActivityDescription = (activity) => {
            let creator = activity.creator.name;
            switch (activity.updateField){
                case 'create' :
                    return `${creator} ${$i18next('created')} ${activity.entityObj.title}`;
                    break;
                case 'due' :
                    return `${creator} ${$i18next('changedDueDateTo')} ${moment(activity.entityObj.due).format('DD/MM/YYYY')}`;
                    break;
                case 'status' :
                    return `${creator} ${$i18next('changedStatusTo')} ${activity.current}`;
                    break;
                case 'title' :
                    return `${creator} ${$i18next('changedTitleTo')} ${activity.current}`;
                    break;
                case 'assign' :
                    return `${creator} ${$i18next('assigned')} ${ getUser(activity.current).username }`;
                    break;
                case 'location' :
                    return `${creator} ${$i18next('changedLocationTo')} ${activity.current}`;
                    break;
                case 'color' :
                    return `${creator} ${$i18next('updatedColor')} ${activity.current}`;
                    break;
                case 'description' :
                    return `${creator} ${$i18next('updatedDescription')} ${activity.current}`;
                    break;
                case 'comment' :
                    return `${creator} ${$i18next('leavedComment')} ${activity.current}`;
                    break;
                case 'attachment' :
                    return `${creator} ${$i18next('addedAttachment')} ${activity.current}`;
                    break;
                case 'watchers' :
                    return `${creator} ${$i18next('changedWatchers')}`;
                    break;
            }
        };

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

        function getUser(userId){
            return $scope.users.find( user => user._id === userId)
        }

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
