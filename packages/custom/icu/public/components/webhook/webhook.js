'use strict';

angular.module('mean.icu.ui.webhook', []).controller('webhookController', 
    function($scope, me) {
        console.log('asd')
        $scope.data = {
            entity: 'task'
        }

        $scope.createWebhook = function() {
            console.log('asdasdasd',$scope.url, me)
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
);