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
        let creator = getUser(activity.creator._id || activity.creator)
        switch (activity.updateField){
          case 'create' :
            return `${$i18next.t('createdBy')} ${creator}`;
            break;
          case 'star' :
            return `${creator} ${$i18next.t('updatedStar')}`;
            break;
          case 'tags' :
            return `${creator} ${$i18next.t('updatedTagsTo')} ${activity.current}`;
            break;
          case 'due' :
            return `${creator} ${$i18next.t('changedDueDateTo')} ${moment( activity.current ).format('DD/MM/YYYY')}`;
            break;
          case 'startDate' :
            return `${creator} ${$i18next.t('changedStartDateTo')} ${moment(activity.current).format('DD/MM/YYYY')}`;
            break;
          case 'endDate' :
            return `${creator} ${$i18next.t('changedEndDateTo')} ${moment(activity.current).format('DD/MM/YYYY')}`;
            break;
          case 'status' :
          return `${creator} ${$i18next.t('changedStatusTo')} ${$i18next.t(activity.current)}`;
            break;
          case 'title' :
            return `${creator} ${$i18next.t('changedTitleTo')} ${activity.current}`;
            break;
          case 'assign' :
            let currentUser = activity.current ? getUser(activity.current._id || activity.current) : null;
            let prevUser = activity.prev ? getUser(activity.prev._id || activity.prev) : null;

            if(currentUser && prevUser)
              return `${creator} ${$i18next.t('assignedUser')} ${currentUser} ${$i18next.t('and')} ${$i18next.t('unassign')} ${prevUser}`;
            else if(currentUser)
              return `${creator} ${$i18next.t('assignedUser')} ${currentUser}`;
            else if(prevUser)
              return `${creator} ${$i18next.t('unassign')} ${prevUser}`;
            else return $i18next.t('unassign');
            break;
          case 'location' :
            return `${creator} ${$i18next.t('changedLocationTo')} ${activity.current}`;
            break;
          case 'color' :
            return `${creator} ${$i18next.t('updatedColor')} ${activity.current}`;
            break;
          case 'description' :
            return `${creator} ${$i18next.t('updatedDescription')} ${activity.current}`;
            break;
          case 'comment' :
            return `${creator} ${$i18next.t('addComment')} ${activity.current}`;
            break;
          case 'attachment' :
            if('current' in activity) {
              return `${creator} ${$i18next.t('addedAttachment')} <strong>${activity.current}</strong>`;
            } else {
              return `${creator} ${$i18next.t('removedAttachment')}`;
            }
            break;
          case 'watchers' :
            return `${creator} ${$i18next.t('changedWatchers')}`;
            break;
        }
      }

      function getUser(userId){
        let user = users.find(user => user._id === userId);
        if(!user) return null;
        let { name, lastname } = user;
        return lastname ? `${name} ${lastname}` : name;
      }

        return {
          getUpdateEntities,
          getActivityDescription,
        };
    });
