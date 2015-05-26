'use strict';

var utils = require('./utils');

var mongoose = require('mongoose');

require('../models/project');
var Project = mongoose.model('Project');

exports.read = function(req, res, next) {	

	var query = {};

	if (req.params.id) {
		query._id = req.params.id;
	}	

	var Query = Project.find(query);
	Query.limit(200 || req.query.limit);
	Query.exec(function(err, projects) {
		
		utils.checkAndHandleError(err, res, 'Failed to create project');

		res.status(200);
		return res.json(projects);
	});
}

exports.create = function(req, res, next) {

	//this is just sample - validation coming soon
	//We deal with each field indavidually unless it is in a schemaless object
	if (req.params.id) {
		return res.send(401, 'Cannot create project with predefined id');
	}

	var data = {
		created: new Date(),
		updated: new Date(),
		title: req.body.title,
		parent: req.body.parent || null,
		color: req.body.color || null,
    discussion: req.body.discussion || null,
    creator : req.user._id
	};

	new Project(data).save(function(err, project ) {
		
		utils.checkAndHandleError(err,res);

		res.status(200);
		return res.json(project);
	});	
}

exports.update = function(req, res, next) {

	if (!req.params.id) {
		return res.send(404, 'Cannot update project without id');
	}

	var data = {
		updated: new Date()		
	};

	(req.body.title) ? data.title = req.body.title : null;	

	(req.body.parent) ? data.parent = req.body.parent : null;	

	(req.body.color) ? data.color = req.body.color : null;	

	Project.findOneAndUpdate({_id:req.params.id}, {$set:data}, function (err, project) {

		utils.checkAndHandleError(err, res, 'Failed to update project');

		res.status(200)
		return res.json(project);
	});
	
}

exports.destroy = function(req, res, next) {

	if (!req.params.id) {
		return res.send(404, 'Cannot destroy project without id');
	}

	Project.remove({_id:req.params.id}, function(err, success) {
		
		utils.checkAndHandleError(err, res, 'Failed to destroy project');

		res.status(200);
		return res.send(success ? 'Project deleted': 'Failed to delete project');
	});
}
