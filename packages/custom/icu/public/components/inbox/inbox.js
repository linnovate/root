'use strict';

angular.module('mean.icu.ui.inbox', [])
.controller('InboxListController',
    function ($scope, $state, $stateParams, $i18next, me, activities, entities) {
        $scope.me = me;
        $scope.activities = activities;
        $scope.entities = entities;
        $scope.inboxState = 'main.inbox';

        $scope.getActivityDescription = (activity) => {
            let creator = activity.entityObj.creator._id === me._id ? me.username : activity.entityObj.creator.username;

            switch (activity.type){
                case 'create' :
                    return `${creator} ${$i18next('created')} ${activity.entityObj.title}`;
                    break;
                case 'updateWatcher' :
                    let newWatcher = activity.userObj.toString();
                    return (creator === me._id)
                        ? `${$i18next('youAddedAsWatcher')} ${newWatcher}`
                        : `${creator} ${$i18next('addedYouAsWatcher')}`;
                    break;
                case 'removeWatcher' :
                    return `${creator} ${$i18next('removedWatcher')} ${activity.userObj.username}`;
                    break;
                case 'updateEntity' :
                    return `${creator} ${$i18next('changedParentOf')} ${activity.entityObj.title} ${$i18next('to')} ${activity.entityObj.title}`;
                    break;
                case 'updateNewEntity' :
                    return `${creator} ${$i18next('bindedEntity')} ${activity.entityObj.title} ${$i18next('with')} ${activity.entity}`;
                    break;
                case 'assign' :
                case 'assignNew' :
                    return `${creator} ${$i18next('assigned')} ${activity.userObj.username} ${$i18next('to')} ${activity.entityObj.title}`;
                    break;
                case 'unassign' :
                    return `${creator} ${$i18next('unassigned')} ${activity.userObj.username} ${$i18next('from')} ${activity.entityObj.title}`;
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
    });
