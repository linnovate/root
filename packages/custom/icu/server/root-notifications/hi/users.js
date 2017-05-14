'use strict';

var talkToRocketChat = require('./talkToRocketChat')

module.exports = function(rocketChat) {
	return {
		login: function(req, res, next) {
			talkToRocketChat.talkToRocketChat(rocketChat, {
				method: 'POST',
				cmd: '/api/v1/login',
				form: {
					user: req.body.user,
					password: req.body.password
				}
			}, function(error, result) {
				return res.send({
					error: error,
					result: result
				});
			});
		}
	}
};