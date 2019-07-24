"use strict";

// $viewPathProvider, to allow overriding system default views
angular.module("mean.system").provider("$viewPath", function() {
  function ViewPathProvider() {
    var overrides = {};

    this.path = function(path) {
      return function() {
        return overrides[path] || path;
      };
    };

    this.override = function(defaultPath, newPath) {
      if (overrides[defaultPath]) {
        throw new Error("View already has an override: " + defaultPath);
      }
      overrides[defaultPath] = newPath;
      return this;
    };

    this.$get = function() {
      return this;
    };
  }

  return new ViewPathProvider();
});

// $meanStateProvider, provider to wire up $viewPathProvider to $stateProvider
angular.module("mean.system").provider("$meanState", [
  "$stateProvider",
  "$viewPathProvider",
  function($stateProvider, $viewPathProvider) {
    function MeanStateProvider() {
      this.state = function(stateName, data) {
        if (data.templateUrl) {
          data.templateUrl = $viewPathProvider.path(data.templateUrl);
        }
        $stateProvider.state(stateName, data);
        return this;
      };

      this.$get = function() {
        return this;
      };
    }

    return new MeanStateProvider();
  }
]);

//Setting up route
angular
  .module("mean.system")
  .config([
    "$meanStateProvider",
    "$urlRouterProvider",
    function($meanStateProvider, $urlRouterProvider) {
      // For unmatched routes:
      $urlRouterProvider.otherwise("/404");

      // states for my app
      $meanStateProvider.state("home", {
        /*Made By OHAD - route to auth insteed of the MEAN.io template*/
        //url: '/',
        //templateUrl: 'system/views/index.html'
        url: "/",
        resolve: {
          checkLogin: [
            "$state",
            "$timeout",
            "UsersService",
            function($state, $timeout, UsersService) {
              return UsersService.getMe().then(function(result) {
                if (result._id) {
                  return $timeout(function() {
                    $state.go("main.tasks.byassign");
                  });
                } else {
                  if (config.activeProvider === "local") {
                    return $timeout(function() {
                      $state.go("login");
                    });
                  } else if (config.activeProvider === "saml") {
                    return $timeout(function() {
                      $state.go("saml");
                    });
                  } else {
                    return $timeout(function() {
                      $state.go("auth");
                    });
                  }
                }
              });
            }
          ]
        }
      });

      $meanStateProvider.state("Log Out", {
        controller: function() {
          window.location = "/logout";
        }
      });
    }
  ])
  .config([
    "$locationProvider",
    function($locationProvider) {
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
    }
  ]);
