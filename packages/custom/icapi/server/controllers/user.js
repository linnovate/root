'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var utils = require('./utils.js');

exports.read = function(req, res, next) {
	var query = {};

	if (req.params.id) {
		query._id = req.params.id;
	}	

	var Query = User.find(query);
	Query.limit(200 || req.query.limit);
	Query.exec(function(err, users) {
		
		utils.checkAndHandleError(err, res, 'Failed to read task');

		res.status(200);
		return res.json(users);
	});
}

exports.readByEntityId = function(req, res, next) {	
	var query = {};

	var Query = User.find(query);
	Query.limit(200 || req.query.limit);
	Query.exec(function(err, users) {
		
		utils.checkAndHandleError(err, res, 'Failed to read task');

		res.status(200);
		return res.json(users);
	});
}
