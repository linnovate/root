'use strict';

angular.module('mean.icu.data.inboxservice', [])
    .service('InboxService', function(ApiUri, $http, $stateParams, $i18next, WarningsService, UsersService
    ) {
        const EntityPrefix = '/inbox';
        let users = [];
        UsersService.getAll().then( allUsers => {
          users = allUsers;
        });

        function getUpdateEntities(activities) {
            return $http.post(ApiUri + EntityPrefix, activities)
                .then(result => {
                        WarningsService.setWarning(result.headers().warning);
                        return result.data;
                    },err => console.error(err)
                );
        }

      function getActivityDescription (activity) {
        let creator = activity.creator.name;
        switch (activity.updateField){
          case 'create' :
            let entityName = ( activity.entityObj && activity.entityObj.title) ? activity.entityObj.title || activity.entityObj : $i18next('this');
            return `${creator} ${$i18next('created')} ${entityName}`;
            break;
          case 'star' :
            return `${creator} ${$i18next('updatedStar')}`;
            break;
          case 'tags' :
            return `${creator} ${$i18next('updatedTagsTo')} ${activity.current}`;
            break;
          case 'due' :
            return `${creator} ${$i18next('changedDueDateTo')} ${moment( activity.current ).format('DD/MM/YYYY')}`;
            break;
          case 'deadline' :
            return `${creator} ${$i18next('changedDeadlineTo')} ${moment(activity.date).format('DD/MM/YYYY')}`;
            break;
          case 'status' :
          return `${creator} ${$i18next('changedStatusTo')} ${$i18next(activity.current)}`;
            break;
          case 'title' :
            return `${creator} ${$i18next('changedTitleTo')} ${activity.current}`;
            break;
          case 'assign' :
            let currentUser = getUser(activity.current);
            let prevUser = getUser(activity.prev);
            return currentUser
              ? `${creator} ${$i18next('assigned')} ${ currentUser.username}`
              : `${creator} ${$i18next('unassign')} ${ prevUser.username}`;
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
            return `${activity.current}`;
            break;
          case 'attachment' :
            return `${activity.current}`;
            break;
          case 'watchers' :
            return `${creator} ${$i18next('changedWatchers')}`;
            break;
        }
      }

      function getUser(userId){
        return users.find( user => user._id === userId)
      }

        return {
          getUpdateEntities,
          getActivityDescription,
        };
    });
