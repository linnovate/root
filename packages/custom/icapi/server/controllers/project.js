'use strict';

var utils = require('./utils');

var ProjectCrud = require('../../../general/server/providers/crud').Project;
var Project = new ProjectCrud('projects');
exports.read = function(req, res, next) {	

	var query = {};

	if (req.params.id) {
		query._id = req.params.id;
	}	

	var Query = Project.get(query);
	Query.limit(200 || req.query.limit);
	Query.exec(function(err, projects) {
		
		utils.checkAndHandleError(err, res, 'Failed to create project');

		res.status(200);
		return res.json(projects);
	});
}

exports.create = function(req, res, next) {
console.log('-----icu create --packages icapi---')
	//this is just sample - validation coming soon
	//We deal with each field individually unless it is in a schemaless object
	if (req.params.id) {
		return res.send(401, 'Cannot create project with predefined id');
	}
	req.body.creator = "55755f55e7e0f6d3717444f3";
	//var data = {
	//	title: req.body.title,
	//	parent: req.body.parent || null,
	//	color: req.body.color || null,
	//	discussion: req.body.discussion || null,
	//	creator : req.user._id
	//};

	//Project.create(req.body, function(x, y) {
	//	console.log(x,y);
	//})

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
