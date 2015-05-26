'use strict';

var utils = require('./utils');

var mongoose = require('mongoose');

require('../models/task');
var Task = mongoose.model('Tasks');

exports.read = function(req, res, next) {	

	var query = {};

	if (req.params.id) {
		query._id = req.params.id;
	}	

	var Query = Task.find(query);
	Query.limit(200 || req.query.limit);
	Query.exec(function(err, tasks) {
		
		utils.checkAndHandleError(err, res, 'Failed to read task');

		res.status(200);
		return res.json(tasks);
	});
}

exports.create = function(req, res, next) {

	//this is just sample - validation coming soon
	//We deal with each field indavidually unless it is in a schemaless object
	if (req.params.id) {
		return res.send(401, 'Cannot create task with predefined id');
	}

	var data = {
		created: new Date(),
		updated: new Date(),
		title: req.body.title,
		parent : req.body.parent || null,
		discussion : req.body.discussion || null,
		project : req.body.project,
    creator : req.user._id,
    tags: req.body.tags || [],
    due: req.body.due || null,
    status: 'Received'
	};

	new Task(data).save(function(err, task ) {
		
		utils.checkAndHandleError(err,res);

		res.status(200);
		return res.json(task);
	});	
}

exports.update = function(req, res, next) {

	if (!req.params.id) {
		return res.send(404, 'Cannot update task without id');
	}

	var data = {
		updated: new Date()		
	};

	(req.body.title) ? data.title = req.body.title : null;	

	(req.body.parent) ? data.parent = req.body.parent : null;	

	(req.body.tags) ? data.tags = req.body.tags : null;	

	(req.body.due) ? data.due = req.body.due : null;	


	Task.findOneAndUpdate({_id:req.params.id}, {$set:data}, function (err, task) {

		utils.checkAndHandleError(err, res, 'Failed to update task');

		res.status(200)
		return res.json(task);
	});
	
}

exports.destroy = function(req, res, next) {

	if (!req.params.id) {
		return res.send(404, 'Cannot destroy task without id');
	}

	Task.remove({_id:req.params.id}, function(err, success) {
		
		utils.checkAndHandleError(err, res, 'Failed to destroy task');

		res.status(200);
		return res.send(success ? 'Task deleted': 'Failed to delete task');
	});
}
