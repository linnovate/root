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
    $scope.menu = {
      isHidden: false
    };

    $scope.detailsPane = {
      isHidden: false
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
    $scope.currentState = $state.current.name;

    $scope.showSvg = config.showSvg;
    $scope.svgUrl = config.svgUrl;

    var entityMap = {
      project: "projects",
      discussion: "discussions",
      user: "people",
      office: "offices",
      folder: "folders",
      officeDocument: "officeDocuments",
      templateDoc: "templateDocs"
    };

    setTimeout(function() {
      $scope.showSvg = !$scope.showSvg;
      $scope.$apply();
    }, 5000);

    $scope.getSvgUrl = function(url) {
      return $sce.trustAsResourceUrl(url);
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
      if (state !== 4 && state !== 1) {
        $scope.hiddenButton = true;
      } else {
        $scope.hiddenButton = false;
      }
    };

    $scope.hiddenButton = false;

    //Made By OHAD
    //$state.go('socket');
    //END Made By OHAD

    function initializeContext(state) {
      if (state.name.indexOf("main") === 0) {
        var restoredContext = context.getContextFromState(state);
        if (
          restoredContext.entityName !== "all" &&
          restoredContext.entityName !== "my"
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
              // } else if ($scope.officeDocuments[0] && restoredContext.main !== 'officeDocument') {
              //     context.entityName = 'officeDocument';
              //     context.entity = $scope.officeDocuments[0];
              //     context.entityId = $scope.officeDocuments[0]._id;
              // } else if ($scope.discussions[0] && restoredContext.main === 'officeDocument') {
              //     context.entityName = 'discussion';
              //     context.entity = $scope.discussions[0];
              //     context.entityId = $scope.discussions[0]._id;
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
      $scope.currentState = toState.name;
      if (toState.url !== "/modal") {
        if (LayoutService.show() && $scope.detailsPane.isHidden) {
          $state.go(toState.name + ".modal");
        }
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
