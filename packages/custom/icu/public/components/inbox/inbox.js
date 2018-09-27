'use strict';

angular.module('mean.icu.ui.inbox', [])
.controller('InboxListController',
    function ($scope, $state, $stateParams, me, activities, entities) {
        $scope.me = me;
        $scope.activities = activities;
        $scope.entities = entities;

        $scope.getUpdateData = (update) => {
            let creator = update.entity.creator;

            switch (update.type){
                case 'create' :
                    return getEntityById(update.issueId).title;
                    break;
                case 'updateNewTitle' :
                    return update.status;
                    break;
                case 'updateTitle' :
                    if(update.entity.creator._id === me._id){
                        `${me.username} ${$i18next('updatedTitle')}`
                    } else {
                        `${update.entity.creator.username}`
                    }
                    `${creator} ${$i18next('addedYouAsWatcher')}`;
                    return update.status;
                    break;
                case 'updateWatcher' :
                    let newWatcher = update.userObj.toString();
                    return (creator === me._id)
                        ? `${$i18next('youAddedAsWatcher')} ${newWatcher}`
                        : `${creator} ${$i18next('addedYouAsWatcher')}`;
                    break;
                case 'removeWatcher' :
                    break;

            }
        };

        $scope.getParent = activity => {
            let entity = activity.entity;
            let parent = entity.project || entity.folder || entity.office;

            if(parent){
                activity.parent = parent.title;
                activity.parentColor = parent.color;
            }
        };

        function getEntityById(id){
            return $scope.entities.find( entity => entity._id === id)
        }

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
        }
    });
