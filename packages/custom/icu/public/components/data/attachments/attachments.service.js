"use strict";

angular
  .module("mean.icu.data.attachmentsservice", [])
  .service("AttachmentsService", function(
    $http,
    $timeout,
    ApiUri,
    Upload,
    UsersService,
    WarningsService
  ) {
    let EntityPrefix = "/attachments";

    function getAttachmentUser(_id) {
      return UsersService.getById(_id).then(user => {
        return user;
      });
    }

    function fillActivitiesWithAttachments(activities) {
      if (!activities) return;

      let activitiesIds = getActivitiesAttachments(activities);
      return downloadAttachments(activitiesIds).then(attachments =>
        insertAttachmentsToActivities(attachments.data, activities)
      );
    }

    function getActivitiesAttachments(activities) {
      if (!activities) return;
      let activitiesWithAttachmentIds = [];

      for (let activity in activities) {
        let act = activities[activity];

        if (act.updateField === "attachment") {
          activitiesWithAttachmentIds.push(act._id);
        }
      }
      return activitiesWithAttachmentIds;
    }

    function downloadAttachments(attachmentIds) {
      return $http.post(ApiUri + EntityPrefix + "/byIds", attachmentIds);
    }

    function insertAttachmentsToActivities(attachments, activities) {
      for (let attachment in attachments) {
        let attach = attachments[attachment];
        let act = activities.find(activity => attach.issueId === activity._id);

        act.attachments = act.attachments || [];
        act.attachments.push(attach);
      }
      return activities;
    }

    function previewWindow(document1) {
      if (document1.spPath) {
        var spSite = document1.spPath.substring(
          0,
          document1.spPath.indexOf("ICU") + 3
        );

        var uri =
          spSite +
          "/_layouts/15/WopiFrame.aspx?sourcedoc=" +
          document1.spPath +
          "&action=default";
        window.open(uri, "_blank");
      } else {
        // Check if need to view as pdf
        if (
          document1.documentType == "docx" ||
          document1.documentType == "doc" ||
          document1.documentType == "xlsx" ||
          document1.documentType == "xls" ||
          document1.documentType == "ppt" ||
          document1.documentType == "pptx"
        ) {
          var arr = document1.path.split("." + document1.documentType);
          var ToHref = arr[0] + ".pdf";
          $http({
            url: ToHref.replace("/files/", "/api/files/"),
            method: "HEAD"
          })
            .success(function() {
              // There is allready the convert file
              window.open(ToHref + "?view=true");
            })
            .error(function() {
              // Send to server
              $.post("/officeDocsAppend.js", document1)
                .done(function(document2) {
                  // The convert is OK and now we open the pdf to the client in new window
                  window.open(ToHref + "?view=true");
                })
                .fail(function(xhr) {
                  console.error(xhr.responseText);
                });
            });
        }
        // Format is NOT needed to view as pdf
        else {
          window.open(document1.path + "?view=true");
        }
      }
    }

    function previewTab(document1) {
      if (document1.spPath) {
        var spSite = document1.spPath.substring(
          0,
          document1.spPath.indexOf("ICU") + 3
        );

        var uri =
          spSite +
          "/_layouts/15/WopiFrame.aspx?sourcedoc=" +
          document1.spPath +
          "&action=default";

        window.open(uri, "_blank");
      } else {
        // Check if need to view as pdf
        if (
          document1.documentType == "docx" ||
          document1.documentType == "doc" ||
          document1.documentType == "xlsx" ||
          document1.documentType == "xls" ||
          document1.documentType == "ppt" ||
          document1.documentType == "pptx"
        ) {
          var arr = document1.path.split("." + document1.documentType);
          var ToHref = arr[0] + ".pdf";
          // Check if convert file exists allready
          $http({
            url: ToHref.replace("/files/", "/api/files/"),
            method: "HEAD"
          })
            .success(function() {
              // There is allready the convert file
              window.open(ToHref + "?view=true");
            })
            .error(function() {
              // Send to server
              $.post("/officeDocsAppend.js", document1)
                .done(function(document2) {
                  // The convert is OK and now we open the pdf to the client in new window
                  window.open(ToHref + "?view=true");
                })
                .fail(function(xhr) {
                  console.error(xhr.responseText);
                });
            });
        }
        // Format is NOT needed to view as pdf
        else {
          window.open(document1.path + "?view=true");
        }
      }
    }

    return {
      previewTab: previewTab,
      previewWindow: previewWindow,
      getAttachmentUser: getAttachmentUser,
      fillActivitiesWithAttachments: fillActivitiesWithAttachments
    };
  });
