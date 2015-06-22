'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Projects, app, auth, database) {

	var ProjectC = require('../../../general/server/providers/crud.js').Project,
		Project = new ProjectC('/projects');
console.dir(Project)
	app.route('/api/projects')

		.post(function(req, res) {
			console.log('here package projects ');
			req.body.user = {_id: '55755f55e7e0f6d3717444f3'}
			Project.create({
				data: req.body
			}, function(data) {
				res.send(data);
			});
		})
		.get(function(req, res) {
			console.log('get all');
			req.body.user = {_id: '55755f55e7e0f6d3717444f3'}
			Project.all({
				data: req.body
			}, function(data) {
				res.send(data);
			});
		});


	app.route('/api/projects/:projectId')

		.put(function(req, res) {
			Project.update({
				data: req.body,
				param: req.params.projectId
			}, function(data) {
				res.send(data);
			});
		})

		.delete(function(req, res) {
			Project.delete({
				param: req.params.projectId
			}, function(data) {
				res.send(data);
			});
		});
};