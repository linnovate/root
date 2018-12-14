'use strict';

angular.module('mean.icu.data.discussionsservice', [])
  .service('DiscussionsService', function (ApiUri, $http, $stateParams,
                                           BoldedService, NotifyingService, PaginationService, WarningsService, ActivitiesService) {
    var EntityPrefix = '/discussions';
    var data = [];

    function getAll(start, limit, sort) {
        var qs = {
            start: start,
            sort: sort
        };
        let paramsId = $stateParams.id;
        qs.limit = findInExistingDiscussions(paramsId) ? limit : paramsId;
        qs = querystring.encode(qs);

        if (qs.length) {
            qs = '?' + qs;
        }

        return $http.get(ApiUri + EntityPrefix + qs).then(function(result) {
            WarningsService.setWarning(result.headers().warning);
            data = result.data.content;
            return result.data;
        }, function(err) {
            return err;
        }).then(function(some) {
            var data = some.content ? some : [];
            return PaginationService.processResponse(data);
        });
    }

      function findInExistingDiscussions(id){
          if(!id)return true;
          return !!data.find( taskInList => taskInList._id === id );
      }

    function getById(id) {
      return $http.get(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function getByEntityId(entity) {
      return function(id, start, limit, sort, starred) {
        var qs = querystring.encode({
          start: start,
          limit: limit,
          sort: sort
        });

        if(qs.length) {
          qs = '?' + qs;
        }

        var url = ApiUri + '/' + entity + '/' + id + EntityPrefix;
        if(starred) {
          url += '/starred';
        }

        return $http.get(url + qs).then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return PaginationService.processResponse(result.data);
        });
      };
    }

    function create(discussion) {
      return $http.post(ApiUri + EntityPrefix, discussion).then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        NotifyingService.notify('editionData');
        return result.data;
      });
    }

    function update(discussion) {
      return $http.put(ApiUri + EntityPrefix + '/' + discussion._id, discussion)
        .then(result => {
          NotifyingService.notify('editionData');
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        }).then(entity => BoldedService.boldedUpdate(entity, 'discussions', 'update'));
    }

    function remove(id) {
      return $http.delete(ApiUri + EntityPrefix + '/' + id).then(function(result) {
        NotifyingService.notify('editionData');
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function star(discussion) {
      return $http.patch(ApiUri + EntityPrefix + '/' + discussion._id + '/star', {star: !discussion.star})
        .then(result => {
          WarningsService.setWarning(result.headers().warning);
          discussion.star = !discussion.star;
          return result.data;
        }).then(entity => BoldedService.boldedUpdate(entity, 'discussions', 'update'));
    }

    function getStarred() {
      return $http.get(ApiUri + EntityPrefix + '/starred').then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function getTags() {
      return $http.get(ApiUri + EntityPrefix + '/tags').then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function summary(discussion) {
      return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/summary').then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function schedule(discussion) {
      return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/schedule').then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      }).then(entity => BoldedService.boldedUpdate(entity, 'discussions', 'update'));
    }

    function cancele(discussion) {
      return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/cancele').then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      }).then(entity => BoldedService.boldedUpdate(entity, 'discussions', 'update'));
    }

    function createActivity(updateField){
      return function(entity, me, prev, remove){
        return ActivitiesService.create({
          data: {
            creator: me,
            date: new Date(),
            entity: entity.id,
            entityType: 'discussion',

            updateField: updateField,
            current: entity[updateField],
            prev: prev ? prev[updateField] : ''
          },
          context: {}
        }).then(function(result) {
          if (updateField === 'assign' && entity.assign) {
            var message = {};
            message.content = entity.title || '-';
          }
          return result.data;
        });
      }
    }

    function WantToCreateRoom(discussion) {
      return $http.post(ApiUri + EntityPrefix + '/' + discussion._id + '/WantToCreateRoom', discussion)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          discussion.WantToCreateRoom = !discussion.WantToCreateRoom;
          return result.data;
        });
    }

    return {
      getAll: getAll,
      getById: getById,
      getByTaskId: getByEntityId('tasks'),
      getByProjectId: getByEntityId('projects'),
      getTags: getTags,
      create: create,
      update: update,
      remove: remove,
      star: star,
      getStarred: getStarred,
      schedule: schedule,
      summary: summary,
      data: data,
      cancele: cancele,
      updateDeadline: createActivity('deadline'),
      updateStar: createActivity('star'),
      updateTitle: createActivity('title'),
      updateDescription: createActivity('description'),
      updateStatus: createActivity('status'),
      updateAssign: createActivity('assign'),
      updateTags: createActivity('tags'),
      updateWatcher: createActivity('watchers'),
      updateLocation: createActivity('location'),
      WantToCreateRoom: WantToCreateRoom,
    };
  });
