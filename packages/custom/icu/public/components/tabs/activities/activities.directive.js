"use strict";

angular.module("mean.icu.ui.tabs").directive("icuTabsActivities", function() {
  function controller(
    $scope,
    $state,
    $timeout,
    context,
    $http,
    UsersService,
    DocumentsService,
    PermissionsService,
    ActivitiesService,
    BoldedService,
    $stateParams,
    InboxService,
    AttachmentsService,
    FilesService
  ) {
    $scope.isLoading = true;
    $scope.activity = {
      description: ""
    };

    ActivitiesService.entityType = $scope.entityName;
    ActivitiesService.entity = $stateParams.id || $stateParams.entityId;
    $scope.getActivityDescription = InboxService.getActivityDescription;

    $scope.context = context;
    $scope.stateParams = $stateParams;

    if ($scope.entity)
      $scope.isRecycled = $scope.entity.hasOwnProperty("recycled");

    $scope.havePermissions = function(type) {
      if ($scope.entity)
        return (
          PermissionsService.havePermissions($scope.entity, type) &&
          !$scope.isRecycled
        );
    };

    $scope.details = {
      create: {
        type: "text",
        value: "createdThis"
      }
    };

    UsersService.getMe().then(function(user) {
      $scope.me = user;
      $scope.activity.user = user;
    });

    $scope.upload = function(files) {
      $scope.attachments = files;
    };

    var clearForm = function() {
      $scope.attachments = [];
      $scope.activity = {
        description: ""
      };
    };

    $scope.$watch("activities", function(nVal, oVal) {
      if (oVal === undefined && nVal !== oVal && !!nVal.length) {
        AttachmentsService.fillActivitiesWithAttachments(
          $scope.activities
        ).then(activities => {
          $scope.activities = activities;
        });
      }
    });

    $scope.download = function(path) {
      var newPath = path.substring(path.indexOf("/files"), path.length);
      newPath = newPath.replace(/\//g, "%2f");
      DocumentsService.getFileFtp(newPath).then(function() {});
    };

    $scope.save = function() {
      if (
        _.isEmpty($scope.attachments) &&
        _.isEmpty($scope.activity.description)
      )
        return;
      $scope.activity.entityType = $scope.entityName;
      $scope.activity.entity = $stateParams.id || $stateParams.entityId;
      $scope.activity.type =
        $scope.attachments && $scope.attachments.length
          ? "document"
          : "comment";

      // $scope.activity.size = $scope.attachments[0].size;

      var isRoomProject = $scope.entityName === "project",
        isRoomFortask =
          $scope.entityName === "task" && $scope.entity.project !== undefined,
        context = {};

      if (isRoomProject || isRoomFortask) {
        //for notification in hi
        context = {
          room: isRoomProject ? $scope.entity.room : $scope.entity.project.room,
          action: "added",
          type: $scope.activity.type,
          description: $scope.activity.description,
          issue: $scope.activity.entityType,
          issueName: $scope.entity.title,
          name: !_.isEmpty($scope.attachments)
            ? $scope.attachments[0].name
            : "",
          location: location.href
        };
      }

      ActivitiesService.create({
        data: {
          creator: $scope.me,
          date: new Date(),
          entity: $scope.entity._id,
          entityType: $scope.entityName,
          updateField: _.isEmpty($scope.attachments) ? "comment" : "attachment",
          current: $scope.activity.description || ""
        },
        context: {}
      })
        .then(function(result) {
          if (!_.isEmpty($scope.attachments)) {
            let data = {
              issueId: result._id,
              issue: "update",
              entity: $scope.entityName,
              entityId: $stateParams.id || $stateParams.entityId
            };
            result.attachments = [];
            return $scope.attachments.reduce((promise, file) => {
              return promise.then(() => {
                return DocumentsService.saveAttachments(data, file).then(
                  function(attachment) {
                    result.attachments[result.attachments.length] = attachment;
                    return result;
                  }
                );
              });
            }, Promise.resolve());
          } else {
            return result;
          }
        })
        .then(result => {
          $scope.activities.push(result);
          clearForm();
          BoldedService.boldedUpdate(
            $scope.entity,
            $scope.entityName + "s",
            "update"
          );
        });
    };

    $timeout(function() {
      $scope.isLoading = false;
    }, 0);

    // Made BY OHAD

    $scope.isOpen = {};
    $scope.trigger = function(document) {
      $scope.isOpen[document._id] = !$scope.isOpen[document._id];
    };
    $scope.view = function(document1) {
      // Check if need to view as pdf
      if (
        document1.attachmentType == "docx" ||
        document1.attachmentType == "doc" ||
        document1.attachmentType == "xlsx" ||
        document1.attachmentType == "xls" ||
        document1.attachmentType == "ppt" ||
        document1.attachmentType == "pptx"
      ) {
        var arr = document1.path.split("." + document1.attachmentType);
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
            $.post("/append.js", document1)
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
    };

    // END Made By OHAD
  }

  function link($scope, $element) {
    var activityList = $element.find(".activities-list");
    var addUpdateField = $element.find(".add-update textarea");

    // $scope.expandUpdate = function() {
    //     if (addUpdateField.height() < 150) {
    //         addUpdateField.css("height", "100px");
    //         activityList.css("height", "calc(100% - 170px)");
    //     }
    // };
    // $scope.minimizeUpdate = function() {
    //     addUpdateField.css("height", "50px");
    //     activityList.css("height", "calc(100% - 120px)");

    // };
  }

  return {
    restrict: "A",
    scope: {
      activities: "=",
      updatedEntities: "=",
      entity: "=",
      entityName: "@"
    },
    replace: true,
    controller: controller,
    link: link,
    templateUrl: "/icu/components/tabs/activities/activities.html"
  };
});
