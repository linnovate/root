angular
  .module("mean.icu.ui.notify", [])
  .factory("NotifyingService", function($rootScope) {
    return {
      subscribe: function(message, callback, scope) {
        var handler = $rootScope.$on(message, callback);
        scope.$on("$destroy", handler);
      },

      notify: function(message) {
        $rootScope.$emit(message);
      }
    };
  });
