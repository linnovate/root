'use strict';

angular.module('mean.mean-socket').controller('MeanSocketController', ['$scope', '$state', 'Global', 'MeanSocket', 'NotificationsService', '$rootScope', 
	function($scope, $state, Global, MeanSocket, NotificationsService, $rootScope) {
        $scope.messages = []
        
		$scope.global = Global;
		$scope.package = {
			name: 'mean-socket'
		};
	
		$scope.socketAfterSend = function(message) {

			$scope.message = {};
		};

		$scope.socketAfterJoin = function(channel, messages) {

			$scope.activeChannel = channel;
			$scope.messages = messages;
		};

		$scope.socketAfterGet = function(message) {
            
            NotificationsService.addLastnotification(message);  
            
		};

		$scope.socketAfterGetChannels = function(channels) {
			$scope.channels = channels;
		};

		$scope.createNewChannel = function(channel) {
			$scope.activeChannel = channel;
			$scope.newChannel = '';
		};
	}
]);