'use strict';
angular.module('mean.icu.ui.webhook', [])
.directive('icuWebhook', function ($uibModal) {
    function controller($scope) {
        $scope.createWebhook = function() {
            if ($scope.me && $scope.me.uid) {
                var url = location.origin + '/api/hook';
                var query = {
                    entity: $scope.data.entity,
                    name: $scope.data.name
                }
                $scope.url = url + '?entity=' + query.entity + '&uid=' + $scope.me.uid;
            }
            
        }
    }

    function link($scope, $element, $attr) {
        $scope.data = {
            entity: 'task'
        }
    }

    return {
        restrict: 'AE',
        scope: {
            me: "="
        },
        controller: controller,
        link: link,
        templateUrl: '/icu/components/webhook/webhook.html'
    };
});

