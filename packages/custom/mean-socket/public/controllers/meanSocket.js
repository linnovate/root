'use strict';

angular.module('mean.mean-socket').controller('MeanSocketController', ['$scope', '$state', 'Global', 'MeanSocket', 'NotificationsService', '$rootScope', 
	function($scope, $state, Global, MeanSocket, NotificationsService, $rootScope) {
        //OHAD
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
			$scope.messages.push(message);
            
            //OHAD
            
            NotificationsService.addLastnotifications();  
            
            //NotificationsService.addNotification("Eran Zehavi", assin);
            NotificationsService.addNotification(message.content, message.name, message.id, message.IsWatched);
            $scope.notifications = NotificationsService.getAll();
            $scope.popupNotifications = $scope.notifications.slice(0, -1);
            
            NotificationsService.addLastnotifications();
            
            $scope.lastNotification = $scope.notifications[$scope.notifications.length - 1];
            $scope.lastNotification1 = $scope.notifications[$scope.notifications.length - 1];    
            
            // For the notifications that didn't been Watched   
            NotificationsService.addnotificationsToWatch(); 
            $scope.notificationsToWatch = NotificationsService.getAllnotificationsToWatch();  
            
            //END OHAD
            
		};

		$scope.socketAfterGetChannels = function(channels) {
			$scope.channels = channels;
		};

		$scope.createNewChannel = function(channel) {
			$scope.activeChannel = channel;
			$scope.newChannel = '';
		};
        
        //OHAD
        //$state.go('main.tasks');
        //END OHAD
        
		// $scope.channel = {
		// 	name: ''
		// };

		// // 			// //App info
		// // // $scope.channels = [];
		// $scope.listeningChannels = [];
		// // // $scope.activeChannel = null;
		// // // $scope.userName = $scope.global.user._id;
		// // // $scope.messages = [];

		// // // ///////////////////////////////////////////////////////////////////////
		// // // ///////////////////////////////////////////////////////////////////////
		// // // //Socket.io listeners
		// // // ///////////////////////////////////////////////////////////////////////
		// // // ///////////////////////////////////////////////////////////////////////

		// // // MeanSocket.on('channels', function channels(channels) {
		// // // 	console.log('channels', channels);

		// // // 	console.log(channels);
		// // // 	$scope.channels = channels;
		// // // 	$scope.channels = channels;
		// // // });

		// // // MeanSocket.on('message:received', function messageReceived(message) {
		// // // 	$scope.messages.push(message);
		// // // });

		// // // MeanSocket.emit('user:joined', {
		// // // 	name: $scope.global.user._id
		// // // });

		// // // MeanSocket.on('user:joined', function(user) {
		// // // 	console.log('user:joined');
		// // // 	$scope.messages.push(user);
		// // // });

		// $scope.listenChannel = function listenChannel(channel) {
		// 	MeanSocket.on('messages:channel:' + channel, function messages(messages) {
		// 		alert(channel)
		// 		MeanSocket.activeChannel = channel;
		// 		$scope.afterJoin({
		// 			messages: messages,
		// 			channel: channel
		// 		});
		// 	});

		// 	MeanSocket.on('message:channel:' + channel, function message(message) {
		// 		console.log('got message: ', message);
		// 		console.log(channel, MeanSocket.activeChannel)
		// 		if (channel === MeanSocket.activeChannel) {
		// 			$scope.meanSocketAfterGet({
		// 				message: message
		// 			});
		// 		}
		// 	});

		// 	MeanSocket.on('message:remove:channel:' + channel, function(removalInfo) {

		// 	});

		// 	if ($scope.listeningChannels.indexOf(channel) === -1)
		// 		$scope.listeningChannels.push(channel);

		// };

		// // Join

		// $scope.joinChannel = function joinChannel(channel) {
		// 	alert(channel);
		// 	//Listen to channel if we dont have it already.
		// 	if ($scope.listeningChannels.indexOf(channel) === -1) {
		// 		$scope.listenChannel(channel);
		// 	}

		// 	MeanSocket.emit('channel:join', {
		// 		channel: channel,
		// 		name: $scope.global.user._id
		// 	});
		// };

		// //Auto join the defaultChannel
		// console.log(typeof MeanSocket.activeChannel)
		// if (typeof MeanSocket.activeChannel === 'undefined')
		// 	$scope.joinChannel('mean');

		// // $scope.$watch('joinToChannel', function() {
		// // 	if ($scope.joinToChannel)
		// // 		$scope.joinChannel($scope.joinToChannel);
		// // });
	}
]);