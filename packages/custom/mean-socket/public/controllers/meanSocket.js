'use strict';

angular.module('mean.mean-socket').controller('MeanSocketController', ['$scope', '$state', 'Global', 'MeanSocket', 'NotificationsService', '$rootScope', 
	function($scope, $state, Global, MeanSocket, NotificationsService, $rootScope) {
        $scope.messages = []
        
		$scope.global = Global;
		$scope.package = {
			name: 'mean-socket'
		};
	
		$scope.socketAfterSend = function(message) {
            console.log("message0");
            console.log(message);
			$scope.message = {};
		};

		$scope.socketAfterJoin = function(channel, messages) {
            console.log("message1");
            console.log(message);
			$scope.activeChannel = channel;
			$scope.messages = messages;
		};

		$scope.socketAfterGet = function(message) {
            console.log("message2");
            console.log(message);
            
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