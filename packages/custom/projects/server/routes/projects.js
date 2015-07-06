'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Projects, app, auth, database) {

	var ProjectC = require('../../../general/server/providers/crud.js').Project,
		Project = new ProjectC('/api/projects');

	app.route('/api/projects')

		.post(function(req, res) {
			Project.create({
				data: req.body,
				headers: req.headers
			}, function(data) {
				res.send(data);
			});
		})
		.get(function(req, res) {
			Project.all({
				data: req.body,
				headers: req.headers
			}, function(data) {
				res.send(data);
			});
		});


	app.route('/api/projects/:projectId')
		.get(function(req, res) {
			Project.get({
				param: req.params.projectId,
				headers: req.headers
			}, function(data) {
				res.send(data);
			});
		})

		.put(function(req, res) {
			Project.update({
				data: req.body,
				param: req.params.projectId,
				headers: req.headers
			}, function(data) {
				res.send(data);
			});
		})

		.delete(function(req, res) {
			Project.delete({
				param: req.params.projectId,
				headers: req.headers
			}, function(data) {
				res.send(data);
			});
		});
};