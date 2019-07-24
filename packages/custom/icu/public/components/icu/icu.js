"use strict";

angular
  .module("mean.icu")
  .controller("IcuController", function(
    $rootScope,
    $scope,
    me,
    $state,
    $stateParams,
    $sce,
    projects,
    discussions,
    officeDocuments,
    offices,
    folders,
    templateDocs,
    people,
    context,
    tasks,
    LayoutService,
    TasksService
  ) {
    let layoutState = LayoutService.getLayoutState();
    $scope.menu = {
      isHidden: layoutState === 3 || layoutState === 2
    };

    $scope.detailsPane = {
      isHidden: layoutState < 3,
      isActive: Boolean($state.params.id)
    };

    $scope.me = me;
    $scope.folders = folders.data || folders;
    $scope.offices = offices.data || offices;
    $scope.tasks = tasks.data || tasks;
    $scope.projects = projects.data || projects;
    $scope.officeDocuments = officeDocuments.data || officeDocuments;
    $scope.templateDocs = templateDocs.data || templateDocs;
    $scope.discussions = discussions.data || discussions;
    $scope.people = people.data || people;

    var entityMap = {
      project: "projects",
      discussion: "discussions",
      user: "people",
      office: "offices",
      folder: "folders",
      officeDocument: "officeDocuments",
      templateDoc: "templateDocs"
    };

    $scope.getLayoutIcon = function() {
      return LayoutService.getLayoutIcon();
    };

    $scope.getSideMenuIcon = function() {
      return LayoutService.getSideMenuIcon();
    };

    $scope.changeLayout = function() {
      var state = LayoutService.changeLayout();
      if (state === 4) {
        $scope.detailsPane.isHidden = false;
        $scope.menu.isHidden = false;
      } else if (state === 3) {
        $scope.detailsPane.isHidden = false;
        $scope.menu.isHidden = true;
      } else if (state === 2) {
        $scope.detailsPane.isHidden = true;
        $scope.menu.isHidden = true;
      } else {
        $scope.detailsPane.isHidden = true;
        $scope.menu.isHidden = false;
      }
    };

    function initializeContext(state) {
      if (state.name.indexOf("main") === 0) {
        var restoredContext = context.getContextFromState(state);
        if (
          restoredContext.entityName !== "all" &&
          restoredContext.entityName !== "my" &&
          restoredContext.main !== "inbox"
        ) {
          context.setMain(restoredContext.main);
          if (restoredContext.entityName === "task") {
            context.entityName = restoredContext.entityName;
            context.entityId = restoredContext.entityId;
            TasksService.getById(restoredContext.entityId).then(function(data) {
              context.entity = data;
            });
          } else {
            var currentEntity = _(
              $scope[entityMap[restoredContext.entityName]]
            ).find(function(e) {
              return e._id === restoredContext.entityId;
            });

            restoredContext.entity = currentEntity;

            if (restoredContext.entityName) {
              context.entityName = restoredContext.entityName;
              context.entity = restoredContext.entity;
              context.entityId = restoredContext.entityId;
            } else if (
              $scope.projects[0] &&
              restoredContext.main !== "project"
            ) {
              context.entityName = "project";
              context.entity = $scope.projects[0];
              context.entityId = $scope.projects[0]._id;
            } else if (
              $scope.discussions[0] &&
              restoredContext.main === "project"
            ) {
              context.entityName = "discussion";
              context.entity = $scope.discussions[0];
              context.entityId = $scope.discussions[0]._id;
            } else if ($scope.offices[0] && restoredContext.main !== "office") {
              context.entityName = "office";
              context.entity = $scope.offices[0];
              context.entityId = $scope.offices[0]._id;
            } else if (
              $scope.discussions[0] &&
              restoredContext.main === "office"
            ) {
              context.entityName = "discussion";
              context.entity = $scope.discussions[0];
              context.entityId = $scope.discussions[0]._id;
            } else if (
              $scope.templateDocs[0] &&
              restoredContext.main !== "templateDoc"
            ) {
              context.entityName = "templateDoc";
              context.entity = $scope.templateDocs[0];
              context.entityId = $scope.templateDocs[0]._id;
            } else if (
              $scope.discussions[0] &&
              restoredContext.main === "templateDoc"
            ) {
              context.entityName = "discussion";
              context.entity = $scope.discussions[0];
              context.entityId = $scope.discussions[0]._id;
            } else if ($scope.folders[0] && restoredContext.main !== "folder") {
              context.entityName = "folder";
              context.entity = $scope.folders[0];
              context.entityId = $scope.folders[0]._id;
            } else if (
              $scope.discussions[0] &&
              restoredContext.main === "folder"
            ) {
              context.entityName = "discussion";
              context.entity = $scope.discussions[0];
              context.entityId = $scope.discussions[0]._id;
            } else {
              context.entityName = "all";
              context.entity = undefined;
              context.entityId = undefined;
            }
          }
        } else {
          context.setMain(restoredContext.main);
          context.entityName = restoredContext.entityName;
          context.entity = undefined;
          context.entityId = undefined;
        }
      }
    }

    $scope.state = $state;
    var state = $state.current;
    state.params = $state.params;
    initializeContext(state);
    $scope.currentContext = context;

    $rootScope.$on("$stateChangeError", function() {});

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams) {
      var state = toState;
      state.params = toParams;
      initializeContext(state);
      initializeContext(state);
    });

    $rootScope.$on("$stateChangeSuccess", function(event, toState) {
      $scope.detailsPane.isActive = Boolean(toState.params.id);
    });

    $scope.closePopup = function(event) {
      let detailspaneElement = document.querySelector("[icu-detailspane]");
      if (event.target === detailspaneElement) {
        $state.go("^.^");
      }
    };

    document.addEventListener("keydown", event => {
      if (
        event.which === 27 &&
        $scope.detailsPane.isActive &&
        $scope.detailsPane.isHidden
      ) {
        $state.go("^.^");
      }
    });
  });

angular.module("mean.icu").run(function($rootScope, $location, $state) {
  $rootScope.$on("$stateChangeError", function(a, b, c, d, f, error) {
    if (error === null) {
      if (config.activeProvider === "local") {
        $state.go("login", null, {
          reload: true
        });
      } else if (config.activeProvider === "saml") {
        $state.go("saml", null, {
          reload: true
        });
      } else {
        $state.go("auth", null, {
          reload: true
        });
      }
    }
  });
});

angular.module("mean.icu").filter("htmlToPlaintext", function() {
  return function(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
});
