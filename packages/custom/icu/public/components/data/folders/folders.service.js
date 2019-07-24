"use strict";

angular
  .module("mean.icu.data.foldersservice", [])
  .service("FoldersService", function(
    ApiUri,
    $http,
    BoldedService,
    NotifyingService,
    PaginationService,
    TasksService,
    $rootScope,
    WarningsService,
    ActivitiesService
  ) {
    var EntityPrefix = "/folders";
    var data = [],
      selected;

    function getAll(start, limit, sort) {
      var qs = querystring.encode({
        start: start,
        limit: limit,
        sort: sort
      });

      if (qs.length) {
        qs = "?" + qs;
      }
      return $http
        .get(ApiUri + EntityPrefix + qs)
        .then(
          function(result) {
            WarningsService.setWarning(result.headers().warning);
            return result.data;
          },
          function(err) {
            return err;
          }
        )
        .then(function(some) {
          var data = some.content ? some : [];
          return PaginationService.processResponse(data);
        });
    }

    function getById(id) {
      return $http.get(ApiUri + EntityPrefix + "/" + id).then(function(result) {
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

        if (qs.length) {
          qs = "?" + qs;
        }

        var url = ApiUri + "/" + entity + "/" + id + EntityPrefix;
        if (starred) {
          url += "/starred";
        }

        return $http.get(url + qs).then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return PaginationService.processResponse(result.data);
        });
      };
    }

    function create(folder) {
      return $http.post(ApiUri + EntityPrefix, folder).then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        NotifyingService.notify("createdElement");
        return result.data;
      });
    }

    function update(folder, context, watcherAction, watcherId) {
      context = context || {};
      if (!context.action) {
        context.action = "updated";
      }
      if (!context.type) {
        context.type = "folder";
      }

      folder.watcherAction = watcherAction;
      folder.watcherId = watcherId;
      return $http
        .put(ApiUri + EntityPrefix + "/" + folder._id, folder)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          if (TasksService.data) {
            TasksService.data.forEach(function(task) {
              if (task.folder && task.folder._id === folder._id) {
                task.folder = result.data;
              }
            });
          }
          if (TasksService.tabData) {
            TasksService.tabData.forEach(function(task) {
              if (task.folder && task.folder._id === folder._id) {
                task.folder = result.data;
              }
            });
          }
          return result.data;
        })
        .then(entity =>
          BoldedService.boldedUpdate(entity, "folders", "update")
        );
    }

    function remove(id) {
      return $http
        .delete(ApiUri + EntityPrefix + "/" + id)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        })
        .then(entity =>
          BoldedService.boldedUpdate(entity, "folders", "update")
        );
    }

    function star(folder) {
      return $http
        .patch(ApiUri + EntityPrefix + "/" + folder._id + "/star", {
          star: !folder.star
        })
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          folder.star = !folder.star;
          return result.data;
        })
        .then(entity =>
          BoldedService.boldedUpdate(entity, "folders", "update")
        );
    }

    function WantToCreateRoom(folder) {
      return $http
        .post(
          ApiUri + EntityPrefix + "/" + folder._id + "/WantToCreateRoom",
          folder
        )
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          folder.WantToCreateRoom = !folder.WantToCreateRoom;
          return result.data;
        });
    }

    function getStarred() {
      return $http
        .get(ApiUri + EntityPrefix + "/starred")
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getTags() {
      return $http.get(ApiUri + EntityPrefix + "/tags").then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function createActivity(updateField) {
      return function(entity, me, prev) {
        return ActivitiesService.create({
          data: {
            creator: me,
            date: new Date(),
            entity: entity.id,
            entityType: "folder",

            updateField: updateField,
            current: entity[updateField],
            prev: prev ? prev[updateField] : ""
          },
          context: {}
        });
      };
    }

    return {
      getAll: getAll,
      getById: getById,
      getByDiscussionId: getByEntityId("discussions"),
      getByUserId: getByEntityId("users"),
      getByOfficeId: getByEntityId("offices"),
      getByFolderId: getByEntityId("folders"),
      getTags: getTags,
      create: create,
      update: update,
      remove: remove,
      star: star,
      getStarred: getStarred,
      data: data,
      selected: selected,
      WantToCreateRoom: WantToCreateRoom,
      updateTitle: createActivity("title"),
      updateStar: createActivity("star"),
      updateDescription: createActivity("description"),
      updateStatus: createActivity("status"),
      updateWatcher: createActivity("watchers")
    };
  });
