'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Projects, app, auth, database) {

	var ProjectC = require('../../../general/server/providers/crud.js').Project,
		Project = new ProjectC('/projects');

	app.route('/projects')

		.post(function(req, res) {
			Project.create({
				data: req.body
			}, function(data) {
				res.send(data);
			});
		});

	app.route('/projects/:projectId')

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