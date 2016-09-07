'use strict';

var mean = require('meanio');
var config = mean.loadConfig();

var circlesLocations = function() {
	var locations = {};
	for (var i in config.circleSettings.circleTypes) {
		if (!locations[config.circleSettings.circleTypes[i].location]) {
			locations[config.circleSettings.circleTypes[i].location] = [];
		}
		locations[config.circleSettings.circleTypes[i].location].push(i);
	}
	return locations;
};

exports.render = function(req, res) {
	res.render('index', {
		config: {
			'lng': config.currentLanguage,
			'activeProvider': config.activeProvider,
			'host': config.host,
			'socketPort': config.socketPort,
			'circles': circlesLocations()
		}
	});
};