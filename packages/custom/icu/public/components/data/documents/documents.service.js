"use strict";

angular
  .module("mean.icu.data.documentsservice", [])
  .service("DocumentsService", function(
    $http,
    ApiUri,
    Upload,
    WarningsService
  ) {
    var EntityPrefix = "/attachments";

    function getAll() {
      return $http.get(ApiUri + EntityPrefix).then(function(result) {
        WarningsService.setWarning(result.headers().warning);
        return result.data;
      });
    }

    function delete1(id, parent) {
      return $http
        .delete(ApiUri + EntityPrefix + "/" + id, { params: parent })
        .then(function(result) {
          //WarningsService.setWarning(result.headers().warning);
          return result.status;
        })
        .catch(err => {
          throw new Error(err.statusText);
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

    function getByOfficeDocumentId(id) {
      return $http
        .get(ApiUri + "/officeDocuments/" + id + EntityPrefix)
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

    function saveAttachments(data, file) {
      return Upload.upload({
        url: "/api/attachments",
        fields: data,
        file: file
      }).then(
        function(resp) {
          console.log(
            "Success " +
              resp.config.file.name +
              "uploaded. Response: " +
              resp.data
          );
          return resp.data;
        },
        function(resp) {
          console.log("Error status: " + resp.status);
        },
        function(evt) {
          var progressPercentage = parseInt((100.0 * evt.loaded) / evt.total);
          console.log(
            "progress: " + progressPercentage + "% " + evt.config.file.name
          );
        }
      );
    }

    function updateAttachment(id, data) {
      return $http
        .post(ApiUri + EntityPrefix + id, data)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function getByTasks() {
      return $http
        .get(ApiUri + "/tasks/myTasks" + EntityPrefix)
        .then(function(result) {
          WarningsService.setWarning(result.headers().warning);
          return result.data;
        });
    }

    function download(data, fileName) {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.setAttribute("style", "display:none");
      var blob = new Blob([new Uint8Array(data)]);
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(function() {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    }

    function getFileFtp(url) {
      return $http({ method: "GET", url: ApiUri + "/ftp/" + url }).then(
        function(response) {
          var json = response.data;
          var fileContent = json.fileContent.data;
          var fileName = json.fileName;
          download(fileContent, fileName);
          return response;
        },
        function(errorResponse) {
          console.dir("ERROR RESPOSE");
          console.dir(errorResponse);
          return errorResponse;
        }
      );
    }

    function viewFileLink(url, type) {
      var uri = ApiUri + "/ftp/" + url;
      return $http({
        method: "GET",
        url: ApiUri + "/ftp/" + url + "&docType=" + type
      }).then(
        function(response) {
          var json = response.data;
          return json.pathForView;
        },
        function(errorResponse) {
          console.dir("ERROR RESPOSE");
          console.dir(errorResponse);
          return errorResponse;
        }
      );
    }

    return {
      delete: delete1,
      getAll: getAll,
      getById: getById,
      getByTaskId: getByTaskId,
      getByProjectId: getByProjectId,
      getByDiscussionId: getByDiscussionId,
      getByUserId: getByUserId,
      saveAttachments: saveAttachments,
      updateAttachment: updateAttachment,
      getByTasks: getByTasks,
      getByOfficeId: getByOfficeId,
      getByFolderId: getByFolderId,
      getByOfficeDocumentId: getByOfficeDocumentId,
      download: download,
      getFileFtp: getFileFtp,
      viewFileLink: viewFileLink
    };
  });
