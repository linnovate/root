'use strict';

angular.module('mean.icu').controller('IcuController',
    function (
        $rootScope,
        $scope,
        me,
        $state,
        $stateParams,
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
        TasksService) {
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
    var entityMap = {
        'project': 'projects',
        'discussion': 'discussions',
        'user': 'people',
        'office':'offices',
        'folder': 'folders',
        'officeDocument': 'officeDocuments',
        'templateDoc': 'templateDocs'
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
      if(state !== 4 && state !== 1){
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
        if (state.name.indexOf('main') === 0) {

            var restoredContext = context.getContextFromState(state);
            if (restoredContext.entityName !== 'all' && restoredContext.entityName !== 'my') {
                context.setMain(restoredContext.main);
                var currentEntity = _($scope[entityMap[restoredContext.entityName]]).find(function(e) {
                    return e._id === restoredContext.entityId;
                });

                restoredContext.entity = currentEntity;

                if (restoredContext.entityName) {
                    context.entityName = restoredContext.entityName;
                    context.entity = restoredContext.entity;
                    context.entityId = restoredContext.entityId;
                } else {
                    context.entityName = 'all';
                    context.entity = undefined;
                    context.entityId = undefined;
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

    $rootScope.$on('$stateChangeError', function () {
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var state = toState;
        state.params = toParams;
        initializeContext(state);
        initializeContext(state);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      $scope.currentState = toState.name;
      if (toState.url !== '/modal') {
        if (LayoutService.show() && $scope.detailsPane.isHidden) {
            $state.go(toState.name + '.modal');
        }
      }

    });
});

angular.module('mean.icu').run(function($rootScope, $location, $state) {
    $rootScope.$on('$stateChangeError', function(a, b, c, d, f, error) {
        if (error === null) {
            if (config.activeProvider === 'local') {
                $state.go('login', null, {
                    reload: true
                });
            } else if (config.activeProvider === 'saml') {
                $state.go('saml', null, {
                    reload: true
                });
            } else {
                $state.go('auth', null, {
                    reload: true
                });
            }
        }
    });
});
