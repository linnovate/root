'use strict';

angular.module('mean.icu.ui.inbox', [])
.controller('InboxListController',
    function ($scope, $state, $stateParams, $i18next, me, activities, entities) {
        $scope.me = me;
        $scope.activities = activities.data;
        $scope.entities = entities;
        $scope.inboxState = 'main.inbox';

        $scope.getActivityDescription = (activity) => {
            let creator;
            if(activity.entityObj)
                creator = activity.entityObj.creator._id === me._id ? me.username : activity.entityObj.creator.username;

            switch (activity.type){
                case 'create' :
                    return `${creator} ${$i18next('created')} ${activity.entityObj.title}`;
                    break;
                case 'updateWatcher' :
                    let newWatcher = activity.userObj.name;
                    return (creator === me._id)
                        ? `${$i18next('youAddedAsWatcher')} ${newWatcher}`
                        : `${creator} ${$i18next('addedYouAsWatcher')}`;
                    break;
                case 'removeWatcher' :
                    return `${creator} ${$i18next('removeWatcher')} ${activity.userObj.name}`;
                    break;
                case 'updateEntity' :
                    return `${creator} ${$i18next('changedParentOf')} ${activity.entityObj.title} ${$i18next('to')} ${activity.entityObj.title}`;
                    break;
                case 'updateNewEntity' :
                    return `${creator} ${$i18next('bindedEntity')} ${activity.entityObj.title} ${$i18next('with')} ${activity.entity}`;
                    break;
                case 'assign' :
                case 'assignNew' :
                    return `${creator} ${$i18next('assigned')} ${activity.userObj.name} ${$i18next('to')} ${activity.entityObj.title}`;
                    break;
                case 'unassign' :
                    return `${creator} ${$i18next('unassigned')} ${activity.userObj.name} ${$i18next('from')} ${activity.entityObj.title}`;
                    break;
                case 'update' :
                case 'updateNew' :
                case 'updateTitle' :
                case 'updateNewTitle' :
                    return `${creator} ${$i18next('updated')} ${activity.entityObj.title}`;
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

        $scope.formatDate = date => {
            date = new Date(date);

            let dd = date.getDate();
            if (dd < 10) dd = '0' + dd;

            let mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;

            let yy = date.getFullYear() % 100;
            if (yy < 10) yy = '0' + yy;

            let hours = date.getHours();
            let minutes = date.getMinutes();

            return `${hours}:${minutes} | ${dd}/${mm}/${yy}`;
        };

        $scope.initiate = function($event, entity, activityType) {
            $state.go($scope.inboxState + '.' + activityType, {
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
        };
    });
