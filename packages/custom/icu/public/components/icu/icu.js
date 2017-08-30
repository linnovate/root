'use strict';

angular.module('mean.icu').controller('IcuController',
    function ($rootScope,
        $scope,
        me,
        $state,
        $stateParams,
        projects,
        discussions,
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
    }

    $scope.me = me;
    $scope.tasks = tasks.data || tasks;
    $scope.projects = projects.data || projects;
    $scope.discussions = discussions.data || discussions;
    $scope.people = people.data || people;
    var entityMap = {
        'project': 'projects',
        'discussion': 'discussions',
        'user': 'people'
    };

    $scope.getLayoutIcon = function() {
      return LayoutService.getLayoutIcon();
    }

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
    }
    
    //Made By OHAD
    //$state.go('socket');
    //END Made By OHAD

    function initializeContext(state) {
        if (state.name.indexOf('main') === 0) {
            
            var restoredContext = context.getContextFromState(state);
            if (restoredContext.entityName !== 'all' && restoredContext.entityName !== 'my') {
                context.setMain(restoredContext.main);
                if (restoredContext.entityName === 'task') {
                    context.entityName = restoredContext.entityName;
                    context.entityId = restoredContext.entityId;
                    TasksService.getById(restoredContext.entityId).then(function(data){
                        context.entity = data;
                    });
                } else {
                    var currentEntity = _($scope[entityMap[restoredContext.entityName]]).find(function(e) {
                        return e._id === restoredContext.entityId;
                    });
    				
                    restoredContext.entity = currentEntity;

                    if (restoredContext.entityName) {
                        context.entityName = restoredContext.entityName;
                        context.entity = restoredContext.entity;
                        context.entityId = restoredContext.entityId;
                    } else if ($scope.projects[0] && restoredContext.main !== 'project') {
                        context.entityName = 'project';
                        context.entity = $scope.projects[0];
                        context.entityId = $scope.projects[0]._id;
                    } else if ($scope.discussions[0] && restoredContext.main === 'project') {
                        context.entityName = 'discussion';
                        context.entity = $scope.discussions[0];
                        context.entityId = $scope.discussions[0]._id;
                    } else {
                        context.entityName = 'all';
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

    var state = $state.current;
    state.params = $state.params;
    initializeContext(state);
    $scope.currentContext = context;

    $rootScope.$on('$stateChangeError', function () {
        // console.log(arguments);
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var state = toState;
        state.params = toParams;
        initializeContext(state);
        initializeContext(state);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      if (toState.url !== '/modal') {
        if (LayoutService.show() && $scope.detailsPane.isHidden) {
            $state.go(toState.name + '.modal');
        }
      }

        // console.log(arguments);
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
