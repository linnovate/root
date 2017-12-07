'use strict';

angular.module('mean.icu.ui.webhook', []).controller('webhookController', 
    function($scope, me) {
        $scope.data = {
            entity: 'task'
        }

        $scope.createWebhook = function() {
            if (me.uid) {
                var url = location.origin + '/api/new';
                var query = {
                    entity: $scope.data.entity,
                    name: $scope.data.name
                }
                $scope.url = url + '?entity=' + query.entity + '&uid=' + me.uid;
            }
            
        }
    }
);