//'use strict'; //fix for safari

angular.module('mean.mean-socket').directive('meanSocket', function(Global, MeanSocket, UsersService) {
    var UsersServicefunc = UsersService;
    
    // UsersServicefunc.getById("5709f2109c69002024f1acf1").then(function(discussion) { 
    //     console.log(discussion.name) 
    // });
	return {
		restrict: 'A',
		scope: {
			message: '=',
			afterSend: '&'
		},
		// templateUrl: 'mean-socket/views/directive.html',
		link: function(scope, elm, attr) {
            
            UsersServicefunc.getMe().then(function (me) {
            console.log(me.name);
            //myname = me.name;
            myname = me._id;
            
			console.log(scope.message);

			scope.global = Global;
            
            scope.global.user = myname;
            MeanSocket.activeChannel = myname;

			// // ///////////////////////////////////////////////////////////////////////
			// // ///////////////////////////////////////////////////////////////////////
			// // // Controller methods
			// // ///////////////////////////////////////////////////////////////////////
			// // ///////////////////////////////////////////////////////////////////////

			scope.sendMessage = function(message) {
				if (!message || message === null || typeof message === 'undefined' || message.length === 0) {
					return;
				}
				MeanSocket.emit('message:send', {
					message: message,
					user: scope.global.user,
					channel: MeanSocket.activeChannel
				});
				scope.afterSend({
					message: message
				});
			};

            });
		}
	};
});


angular.module('mean.mean-socket').directive('useMeanSocket', function(Global, MeanSocket, UsersService, NotificationsService) {
    var UsersServicefunc = UsersService;

	return {
		restrict: 'E',
		scope: {
			joinToChannel: '=',
			afterJoin: '&',
			meanSocketAfterGet: '&',
			meanSocketAfterGetAllChannels: '&'
		},
		link: function(scope, elm, attr) {
            
            UsersServicefunc.getMe().then(function (me) {
                //myname = me.name;
                myname = me._id;
            //});

			scope.global = Global;

			scope.channel = {
				name: ''
			};

			// 			// //App info
			// // $scope.channels = [];
			scope.listeningChannels = [];
			// // $scope.activeChannel = null;
			// // $scope.userName = $scope.global.user._id;
			// // $scope.messages = [];

			// // ///////////////////////////////////////////////////////////////////////
			// // ///////////////////////////////////////////////////////////////////////
			// // //Socket.io listeners
			// // ///////////////////////////////////////////////////////////////////////
			// // ///////////////////////////////////////////////////////////////////////

			MeanSocket.on('channels', function channels(channels) {
				scope.meanSocketAfterGetAllChannels({
					channels: channels
				});
			});

			// // MeanSocket.on('message:received', function messageReceived(message) {
			// // 	$scope.messages.push(message);
			// // });

			MeanSocket.emit('user:joined', {
				user: scope.global.user._id
			});

			MeanSocket.on('user:joined', function user(user) {
				// scope.meanSocketAfterGet({
				// 	message: user
				// });
			});

			scope.listenChannel = function listenChannel(channel) {
				MeanSocket.on('user:channel:joined:' + channel, function user(user) {
					console.log('user:joined', channel);
					// scope.meanSocketAfterGet({
					// 	message: user
					// });
				});

				MeanSocket.on('messages:channel:' + channel, function messages(messages) {
					MeanSocket.activeChannel = channel;
					scope.afterJoin({
						messages: messages,
						channel: channel
					});
				});

				MeanSocket.on('message:channel:' + channel, function message(message) {
					if (scope.listeningChannels.indexOf(channel) !== -1) {
						scope.meanSocketAfterGet({
							message: message
						});
					}
				});

				MeanSocket.on('message:remove:channel:' + channel, function(removalInfo) {

				});

				if (scope.listeningChannels.indexOf(channel) === -1)
					scope.listeningChannels.push(channel);

			};

			// Join

			scope.joinChannel = function joinChannel(channel) {
				//Listen to channel if we dont have it already.
				if (scope.listeningChannels.indexOf(channel) === -1) {
					scope.listenChannel(channel);
				}                                        

				MeanSocket.emit('user joined token', {
					id: myname,
					socket: "first"
				});

			};

			//Auto join the defaultChannel
			scope.joinChannel('mean');
            
            //OHAD
            scope.joinChannel(myname);

			scope.$watch('joinToChannel', function() {
				if (scope.joinToChannel)
					scope.joinChannel(scope.joinToChannel);
			});


});
		}
	};

 });
