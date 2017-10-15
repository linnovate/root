'use strict';

angular.module('mean.icu.ui.webhook', [])
.directive('icuWebhook', function ($uibModal) {
    function controller() {
        $scope.createWebhook = function() {
            if (me.uid) {
                var url = location.origin + '/' + (me.uid);
                var query = {
                    entity: $scope.data.entity,
                    name: $scope.data.name
                }
                $scope.url = url + query.toString();
                
            }
            
        }
    }

    function link($scope, $element, $attr) {
        $scope.data = {
            entity: 'task'
        }
    }

    return {
        restrict: 'A',
        scope: {
           
        },
        controller: controller,
        link: link,
        templateUrl: '/icu/components/webhook/webhook.html'
    };
});

