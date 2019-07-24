"use strict";

angular
  .module("mean.icu.data.templatedocsservice", [])
  .service("TemplateDocsService", function(
    $http,
    BoldedService,
    ApiUri,
    NotifyingService,
    Upload,
    WarningsService,
    PaginationService,
    $rootScope,
    ActivitiesService,
    UsersService
  ) {
    var EntityPrefix = "/officeTemplates";
    var data = [],
      selected;

    //   function getAll() {
    //     return $http.get(ApiUri + EntityPrefix).then(function (result) {
    //         WarningsService.setWarning(result.headers().warning);
    //         return result.data;
    //     });
    // }

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

    function getTemplatesByFolder(folder) {
      return $http
        .post(ApiUri + EntityPrefix + "/getByOfficeId", { folder: folder })
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function deleteTemplate(id) {
      return $http
        .delete(ApiUri + EntityPrefix + "/" + id)
        .then(function(result) {
          NotifyingService.notify("editionData");
          return result.status;
        })
        .then(entity =>
          BoldedService.boldedUpdate(entity, "templateDocs", "update")
        );
    }

    function getByTemplateDocId(id) {
      return $http.get(ApiUri + EntityPrefix + "/" + id).then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function getById(id) {
      return $http.get(ApiUri + EntityPrefix + "/" + id).then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function getByTaskId(id) {
      return $http
        .get(ApiUri + "/tasks/" + id + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getByProjectId(id) {
      return $http
        .get(ApiUri + "/projects/" + id + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getByDiscussionId(id) {
      return $http
        .get(ApiUri + "/discussions/" + id + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getByOfficeId(id) {
      return $http
        .get(ApiUri + "/offices/" + id + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getByFolderId(id) {
      return $http
        .get(ApiUri + "/folders/" + id + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getByUserId(id) {
      return $http
        .get(ApiUri + "/users/" + id + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function saveTemplateDoc(data, file) {
      return Upload.upload({
        url: "/api/templates",
        fields: data,
        file: file
      });
    }

    function update(entity, context, watcherAction, watcherId) {
      let json;
      if (
        watcherAction != null &&
        (watcherAction === "removed" || watcherAction === "added")
      ) {
        json = {
          name: "watchers",
          newVal: entity.watchers
        };
      } else
        json = {
          name: "permissions",
          newVal: entity.permissions
        };

      return updateTemplateDoc(entity._id, json);
    }

    function updateTemplateDoc(id, data) {
      return $http
        .post(ApiUri + EntityPrefix + "/" + id, data)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return getById(id).then(entity => {
            let bolded = _.pick(
              BoldedService.boldedUpdate(entity, "templateDocs", "update"),
              "bolded"
            );
            Object.assign(entity, bolded);
            return entity;
          });
        });
    }
    function create(templateDoc) {
      return $http
        .post(ApiUri + EntityPrefix + "/createNew", templateDoc)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          NotifyingService.notify("editionData");
          return result.data;
        });
    }

    function uploadTemplate(data, file) {
      return Upload.upload({
        url: "/api/officeTemplates/uploadTemplate",
        fields: data,
        file: file
      });
    }

    function createActivity(data) {
      Object.assign(data, {
        date: new Date(),
        entityType: "templateDoc"
      });
      return ActivitiesService.create({
        data: data,
        context: {}
      });
    }

    return {
      delete: deleteTemplate,
      getById: getById,
      getByTemplateDocId: getByTemplateDocId,
      getByTaskId: getByTaskId,
      getByProjectId: getByProjectId,
      getByDiscussionId: getByDiscussionId,
      getByUserId: getByUserId,
      saveTemplateDoc: saveTemplateDoc,
      update: update,
      updateTemplateDoc: updateTemplateDoc,
      getByOfficeId: getByOfficeId,
      getByFolderId: getByFolderId,
      getTemplatesByFolder: getTemplatesByFolder,
      getAll: getAll,
      data: data,
      selected: selected,
      create: create,
      uploadTemplate: uploadTemplate,
      createActivity: createActivity
    };
  });
