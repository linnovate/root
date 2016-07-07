'use strict';

var mongoose = require('mongoose');
var Circles = {
	models: {}
};
var configPath = process.cwd() + '/config/actionSettings';

var actionSettings = require(configPath) || {};

var circles = require('../controllers/circles');

module.exports = function() {
	return function(req, res, next) {
		if (req.locals.error) {
			return next();
		}
		circles.getCircles('mine', req.user.id, function(err, data) {
			req.acl = {};
			if (err) {
				req.locals.error = err;
				return next();
			}
			req.acl.user = JSON.parse(data);
			req.acl.query = function(model) {
				if (!Circles.models[model]) {
					Circles.models[model] = mongoose.model(model);
				}
				var conditions = {
					$and: []
				};

				for (var type in actionSettings.circleTypes) {
					var allowed = req.acl.user.allowed[type].map(function(a) {
						return a._id;
					})
					conditions.$and.push(buildConditions(type, actionSettings.circleTypes[type], allowed, req.user._id));
				}
				return Circles.models[model].where(conditions);
			};
			next();

		});
	};
};

var buildConditions = function(type, settings, allowed, userId) {
	var obj1 = {},
		obj2 = {},
		obj3 = {};
	obj1['circles.' + type] = {
		$in: allowed
	};
	obj2['circles.' + type] = {
		$size: 0
	};
	obj3['circles.' + type] = {
		$exists: false
	};
	if (settings.watchers) {
		obj1 = {
			'$or': [obj1, {
				watchers: userId
			}]
		};
		obj2 = {
			'$and': [obj2, {
				watchers: {
					$size: 0
				}
			}]
		};
		obj3 = {
			'$and': [obj3, {
				watchers: {
					$size: 0
				}
			}]
		};
	}
	return {
		'$or': [obj1, obj2, obj3]
	}
};