'use strict';
var baseUrl = config.host + ':' + config.socketPort + '/' ;
// var baseUrl = 'http://10.1.0.84:3003/';
angular.module('mean.mean-socket').factory('MeanSocket', function($rootScope) {
	var socket = io.connect(baseUrl);
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				console.log('event:', eventName);
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});
